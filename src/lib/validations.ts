function newError(err: string){
    if(!!err){
        throw new Error('Parameter just a string')
    }
    throw new Error(err)
}

function functionsValidation(fn: Function, param: string){
    if(!fn || typeof fn !== 'function'){
        newError(`Parameter ${param} just a function`)
    }
}

function objectValidation(obj: {}, param: string){
    if(!obj || typeof obj !== 'object'){
        newError(`Parameter ${param} just a function`)
    }
}

export {
    newError,
    functionsValidation,
    objectValidation
}