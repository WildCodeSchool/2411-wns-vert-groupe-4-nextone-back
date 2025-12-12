export function buildResponse(success: boolean, successMsg: string, errorMsg: string) {
  const res =  {
    success,
    message: success ? successMsg : errorMsg,
  };
  return res
}