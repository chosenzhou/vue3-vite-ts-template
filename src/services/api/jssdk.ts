import type { JssdkSignatureRequest, JssdkSignatureResponse } from '@/services/model';
import { request } from '@/services/http';

export function getJssdkSignature(params: JssdkSignatureRequest) {
  return request.Get<JssdkSignatureResponse>('/jssdk/signature', { params });
}
