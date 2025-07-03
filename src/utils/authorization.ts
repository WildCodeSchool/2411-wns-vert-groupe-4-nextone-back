export function buildResponse(success: boolean, successMsg: string, errorMsg: string) {
  return {
    success,
    message: success ? successMsg : errorMsg,
  };
}