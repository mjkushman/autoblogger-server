
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
    "authorBio":"author_bio",
    "orgId":"org_id", //shouldn't change
    "imageUrl":"image_Url",
    "agentId":"agent_id", //shouldn'change
    "isAuthor": "is_author",
    "schedule":"schedule",
    "isEnabled":"is_enabled",
    }
    
    let updateVals = Object.values(requestBody)

    let updateCols = Object.keys(requestBody).map((k,i) => `"${map[k]}"=$${i+1}`) // Creates a string resembling "field1=$1 field2=$2"
    
    

    return {
        updateCols,
        updateVals
    }
}


module.exports = {updateUserSql}