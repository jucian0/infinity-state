function newError(err: string) {
  if (!!err) {
    throw new Error('Parameter just a string');
  }
  throw new Error(err);
}
/**
 * @param  {Function} fn Function to test validate.
 * @param  {string} param Function name to show warning error.
 */
function functionsValidation(fn: Function, param: string) {
  if (!fn || typeof fn !== 'function') {
    newError(`Parameter ${param} just a function`);
  }
}
/**
 * @param  {{}} obj Object to test validate.
 * @param  {string} param Object name to show warning error.
 */
function objectValidation(obj: {}, param: string) {
  if (!obj || typeof obj !== 'object') {
    newError(`Parameter ${param} just a function`);
  }
}

export { newError, functionsValidation, objectValidation };
