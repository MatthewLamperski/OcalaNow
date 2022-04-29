import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

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
