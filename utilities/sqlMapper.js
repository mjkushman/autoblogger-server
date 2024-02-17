
/** Use this utility to map javascript notation to SQL notation
 * js on the left, name of db column on the right
 *  myVariable ==> my_variable
 */


// used for PATCH, updating users
const updateUserSql = (requestBody) => {
    const map = {
    "username":"username",
    "email":"email",
    "firstName":"first_name",
    "lastName":"last_name",
    "userId":"user_id",
    "userID":"user_id",
    "authorBio":"author_bio"}
    
    let updateVals = Object.values(requestBody)

    let updateCols = Object.keys(requestBody).map((k,i) => `"${map[k]}"=$${i+1}`)
    
    

    return {
        updateCols,
        updateVals
    }
}


module.exports = {updateUserSql}