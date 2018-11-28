'use strict';
var express = require('express');
var axios = require('axios')
var router = express.Router();
//JSON formatted requests for connecting to the fastlink api
var cobrandLogin = require('../templates/cobrandLoginTemplate')
var userLogin = require('../templates/userLoginTemplate')
var tokenRetrieve = require('../templates/tokenRetrieveTemplate')


const postCobrand = async () => {
    try {
        return await axios(
            cobrandLogin
        )
    } catch (error) {
        console.error(error)
    }
}

const postUser = async (cobsession) => {
    try {
        //cobsession value is obtained from postCobrand
        userLogin.headers.Authorization = "cobSession=" + cobsession
        console.log(userLogin)
        return await axios(
            userLogin
        )
    } catch (error) {
        console.error(error)
    }
}

const getToken = async (cobsession, usersession) => {
    try {
        //cobsession and usersession are obtained from postCobrand and postUser respectively
        tokenRetrieve.headers.Authorization = "cobSession=" + cobsession + ",userSession=" + usersession
        return await axios(
            tokenRetrieve
        )
    } catch (error) {
        console.error(error)
    }
}

//Retrieves the session token and id for access to fastlink app
async function login() {
    const cobrand = await postCobrand()
    if (cobrand.data) {
        const user = await postUser(cobrand.data.session.cobSession)
        if (user.data) {
            const token = await getToken(cobrand.data.session.cobSession, user.data.user.session.userSession)
            if (token.data) {
                return [user.data.user.session.userSession, token.data.user.accessTokens[0].value]
            }
        }
    }
}


/* GET home page. */

router.get('/', async function (req, res) {
    var info = await login()
    res.render('test.html', {
        'rsession': info[0],
        'token': info[1]
    })
}); 

module.exports = router;
