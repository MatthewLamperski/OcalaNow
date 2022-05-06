import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';

// Random Helper Functions

export const getBrightness = color => {
  // Variables for red, green, blue values
  let r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/,
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return 'light';
  } else {
    return 'dark';
  }
};

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

export const getTags = () => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('app')
      .doc('appInfo')
      .get()
      .then(docSnapshot => resolve([...docSnapshot.data().tags]))
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
