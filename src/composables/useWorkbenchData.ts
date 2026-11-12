import { onScopeDispose, ref, shallowRef } from 'vue';

export function useWorkbenchData<T>(fetchData: () => PromiseLike<T>) {
  const data = shallowRef<T>();
  const loading = ref(false);
  const error = ref('');
  const forbidden = ref(false);
  let version = 0;
  onScopeDispose(() => {
    version++;
  });
  async function load() {
    const current = ++version;
    loading.value = true;
    error.value = '';
    forbidden.value = false;
    try {
      const result = await fetchData();
      if (current === version)
        data.value = result;
    }
    catch (reason) {
      if (current !== version)
        return;
      forbidden.value = (reason as { status?: number }).status === 403;
      error.value = reason instanceof Error
        ? reason.message
        : '网络异常或服务暂不可用，请稍后重试';
      data.value = undefined;
    }
    finally {
      if (current === version)
        loading.value = false;
    }
  }
  return {
    data,
    loading,
    error,
    forbidden,
    load,
  };
}
