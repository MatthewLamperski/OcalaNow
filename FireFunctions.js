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

export const signOut = () => {
  return new Promise((resolve, reject) => {
    auth()
      .signOut()
      .then(() => {
        GoogleSignin.signOut();
        resolve();
      })
      .catch(err => reject(err));
  });
};

// Firestore Functions

export const getUser = uid => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          resolve({uid: docSnapshot.id, ...docSnapshot.data()});
        } else {
          reject('No user doc');
        }
      })
      .catch(err => reject(err));
  });
};

export const updateUser = user => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('users')
      .doc(user.uid)
      .update(user)
      .then(() => resolve())
      .catch(err => {
        firestore()
          .collection('users')
          .doc(user.uid)
          .set(user)
          .then(() => resolve())
          .catch(err => reject(err));
      });
  });
};

export const getCards = () => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('cards')
      .get()
      .then(querySnapshot => {
        resolve(
          querySnapshot.docs.map(doc => ({docID: doc.id, ...doc.data()})),
        );
      })
      .catch(err => reject(err));
  });
};

export const getAsset = (type, docID) => {
  return new Promise((resolve, reject) => {
    storage()
      .ref(`cards/${docID}/${type}`)
      .getDownloadURL()
      .then(url => resolve(url))
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
