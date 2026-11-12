import { getJssdkSignature } from '@/services/api';

export type WeComJssdk = typeof import('@wecom/jssdk');

export async function useWecomJssdk(jsApiList: string[] = []) {
  const signature = await getJssdkSignature({
    client: 'wecom',
    url: window.location.href.split('#')[0],
    agentId: import.meta.env.VITE_WECOM_AGENT_ID,
  });

  const wecomJssdk: WeComJssdk = await import('@wecom/jssdk');
  const { register, ensureCorpConfigReady } = wecomJssdk;
  const corpId = signature.corpId || import.meta.env.VITE_WECOM_CORP_ID;
  if (!corpId || !signature.agentId) {
    throw new Error('企业微信 JS-SDK 签名缺少 CorpID 或 AgentID。');
  }

  register({
    agentId: signature.agentId,
    corpId,
    getConfigSignature: async () => ({
      timestamp: signature.timestamp,
      nonceStr: signature.nonceStr,
      signature: signature.signature,
    }),
    jsApiList,
  });
  await ensureCorpConfigReady();

  return wecomJssdk;
}
