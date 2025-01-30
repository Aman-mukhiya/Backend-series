// This is know as Higher Order fuction 
// i.e a function that accepts a function as parameter
// const asyncHandler = () =>{}
// const asyncHandler = (func) => { () =>{} }
// const asyncHandler = (func) => async () =>{} 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}

export { asyncHandler }




// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message: err.message
//         })
//     }
// }