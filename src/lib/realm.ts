import * as Realm from 'realm-web';

const realmApp = new Realm.App({ id: process.env.MONGODB_REALM_ID! });

async function signin(accessToken: string) {

    const credentials = Realm.Credentials.jwt(accessToken);
    const user = await realmApp.logIn(credentials);

    return user;

}

async function logout() {
    await realmApp.currentUser?.logOut();
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    signin, logout
}