import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';

// Authentication Functions
export const signInWithEmail = (email, password) => {
  return new Promise((resolve, reject) => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(userRef => {
        resolve(userRef);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const signUpWithEmail = (email, password) => {
  return new Promise((resolve, reject) => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(cred => resolve(cred))
      .catch(err => reject(err));
  });
};

export const continueWithGoogle = () => {
  return new Promise((resolve, reject) => {
    GoogleSignin.signIn()
      .then(({idToken}) => {
        const googleCred = auth.GoogleAuthProvider.credential(idToken);
        auth()
          .signInWithCredential(googleCred)
          .then(() => resolve())
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

export const continueWithApple = () => {
  return new Promise((resolve, reject) => {
    appleAuth
      .performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL],
      })
      .then(appleAuthRequestResponse => {
        if (!appleAuthRequestResponse.identityToken) {
          reject('Apple Sign-In failed - no identity token returned');
        }
        const {identityToken, nonce} = appleAuthRequestResponse;
        const appleCred = auth.AppleAuthProvider.credential(
          identityToken,
          nonce,
        );
        auth()
          .signInWithCredential(appleCred)
          .then(() => resolve())
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

export const getCompanies = () => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('companies')
      .get()
      .then(querySnapshot => {
        let companies = [];
        querySnapshot.forEach(companyDoc => {
          companies.push({
            docID: companyDoc.id,
            ...companyDoc.data(),
          });
        });
        resolve(companies);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const getPicURL = logo => {
  return new Promise((resolve, reject) => {
    storage()
      .ref(`logos/${logo}.png`)
      .getDownloadURL()
      .then(url => resolve(url))
      .catch(err => reject(err));
  });
};
