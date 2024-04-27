async function checkIapplyId(value){
    const regex=/^[A-Z]{2}[0-9]+$/
    return regex.test(value)

}

async function checkEGN(value){
    const regex=/^[0-9]{9,10}$/
    return regex.test(value)

}

async function checkFinCen(value){
    return isValidInteger(value)
}


function isValidInteger(value) {
    // Check if the value is an integer
    if (Number.isInteger(Number(value))) {
      // Check if the value is between 1 and 1000 (inclusive)
      if (value >= 1 && value < 1000) {
        return true;
      }
    }
    return false;
  }
module.exports={checkIapplyId, checkEGN, checkFinCen}