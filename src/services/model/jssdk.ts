export interface JssdkSignatureRequest {
  client: 'wecom'
  url: string
  agentId?: string
}

export interface JssdkSignatureResponse {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
  agentId?: string
  corpId?: string
}
