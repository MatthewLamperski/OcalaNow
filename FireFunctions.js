import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Share from 'react-native-share';
import openMap from 'react-native-open-maps';
import {Alert} from 'react-native';

// Random Helper Functions

export const getNextFeedDate = () => {
  // Saddle up Friday @ noon
  // Out the gate Monday @ 8 AM
  let nextDate = new Date();
  while (nextDate.getDay() !== 1 && nextDate.getDay() !== 5) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  if (nextDate.getDay() === 1) {
    return new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      8,
      0,
      0,
      0,
    );
  } else if (nextDate.getDay() === 5) {
    return new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      12,
      0,
      0,
      0,
    );
  }
};

export const getNextEventDateObj = card => {
  if (card.type !== 'event') {
    return 0;
  } else {
    let date = card.event.startTime.toDate();
    let frequency = card.event.frequency;
    if (frequency === 'once') {
      return date;
    } else if (frequency === 'weekly') {
      let now = new Date();
      console.log(card.docID, frequency, date > now);
      if (date > now) {
        return date;
      } else {
        // date already passed, get the next date
        let newDate = date;
        while (newDate < now) {
          newDate.setDate(newDate.getDate() + 7);
        }
        return newDate;
      }
    } else if (frequency === 'biweekly') {
      let now = new Date();
      if (date > now) {
        return date;
      } else {
        // date already passed, get the next date
        let newDate = date;
        while (newDate < now) {
          newDate.setDate(newDate.getDate() + 14);
        }
        return newDate;
      }
    } else if (frequency) {
      let now = new Date();
      if (date > now) {
        return date;
      } else {
        // date already passed, get the next date
        let newDate = date;
        while (newDate < now) {
          newDate.setDate(newDate.getDate() + Number(frequency));
        }
        return newDate;
      }
    } else {
      return date;
    }
  }
};

export const getNextEventDate = card => {
  if (card.type !== 'event') {
    return '';
  } else {
    let date = new Date(card.event.startTime.seconds * 1000);
    let frequency = card.event.frequency;
    if (frequency === 'once') {
      const month = date.toLocaleString('default', {month: 'long'});
      const day = date.toLocaleString('default', {day: 'numeric'});
      const time = date.toLocaleString('default', {timeStyle: 'short'});
      return `${month} ${day}, ${time}`;
    } else if (frequency === 'weekly') {
      let now = new Date();
      console.log(card.docID, frequency, date > now);
      if (date > now) {
        const month = date.toLocaleString('default', {month: 'long'});
        const day = date.toLocaleString('default', {day: 'numeric'});
        const time = date.toLocaleString('default', {timeStyle: 'short'});
        return `${month} ${day}, ${time}`;
      } else {
        // date already passed, get the next date
        let newDate = date;
        while (newDate < now) {
          newDate.setDate(newDate.getDate() + 7);
        }
        const month = date.toLocaleString('default', {month: 'long'});
        const day = date.toLocaleString('default', {day: 'numeric'});
        const time = date.toLocaleString('default', {timeStyle: 'short'});
        return `${month} ${day}, ${time}`;
      }
    } else if (frequency === 'biweekly') {
      let now = new Date();
      if (date > now) {
        const month = date.toLocaleString('default', {month: 'long'});
        const day = date.toLocaleString('default', {day: 'numeric'});
        const time = date.toLocaleString('default', {timeStyle: 'short'});
        return `${month} ${day}, ${time}`;
      } else {
        // date already passed, get the next date
        let newDate = date;
        while (newDate < now) {
          newDate.setDate(newDate.getDate() + 14);
        }
        const month = date.toLocaleString('default', {month: 'long'});
        const day = date.toLocaleString('default', {day: 'numeric'});
        const time = date.toLocaleString('default', {timeStyle: 'short'});
        return `${month} ${day}, ${time}`;
      }
    } else if (frequency) {
      let now = new Date();
      if (date > now) {
        const month = date.toLocaleString('default', {month: 'long'});
        const day = date.toLocaleString('default', {day: 'numeric'});
        const time = date.toLocaleString('default', {timeStyle: 'short'});
        return `${month} ${day}, ${time}`;
      } else {
        // date already passed, get the next date
        let newDate = date;
        while (newDate < now) {
          newDate.setDate(newDate.getDate() + Number(frequency));
        }
        const month = date.toLocaleString('default', {month: 'long'});
        const day = date.toLocaleString('default', {day: 'numeric'});
        const time = date.toLocaleString('default', {timeStyle: 'short'});
        return `${month} ${day}, ${time}`;
      }
    } else {
      const month = date.toLocaleString('default', {month: 'long'});
      const day = date.toLocaleString('default', {day: 'numeric'});
      const time = date.toLocaleString('default', {timeStyle: 'short'});
      return `${month} ${day}, ${time}`;
    }
  }
};

export const getTimeUntilNextUse = (card, user) => {
  if (!user.used) {
    return 0;
  } else {
    let usedDeals = user.used;
    // if deal is not even in users used
    if (!usedDeals.map(used => used.deal).includes(card.docID)) {
      return 'Already redeemed';
    }
    // If at this point, user has used this deal before
    // check if cooldown timer is up
    if (!card.deal.cooldown) {
      return 'Already redeemed';
    } else {
      let cooldown = Number(card.deal.cooldown);
      let thisDealUsedArr = usedDeals.filter(used => used.deal === card.docID);
      let lastDealUsed = thisDealUsedArr
        .sort((used1, used2) => {
          return used1.usedOn.toDate() < used2.usedOn.toDate();
        })[0]
        .usedOn.toDate();
      const now = new Date();
      const daysSinceLastUse = (now - lastDealUsed) / (1000 * 60 * 60 * 24);
      return `Redeem again in ${(cooldown - daysSinceLastUse).toFixed(0)} days`;
    }
  }
};
export const activated = (card, user) => {
  if (card.type === 'event') {
    if (!user.going) {
      return true;
    } else {
      return !user.going.includes(card.docID);
    }
  } else if (card.type === 'info') {
    return true;
  } else if (card.type === 'deal') {
    if (!user.used) {
      return true;
    } else {
      let usedDeals = user.used;
      // if deal is not even in users used
      if (!usedDeals.map(used => used.deal).includes(card.docID)) {
        return true;
      }
      // If at this point, user has used this deal before
      // check if cooldown timer is up
      if (!card.deal.cooldown) {
        return false;
      } else {
        let cooldown = Number(card.deal.cooldown);
        let thisDealUsedArr = usedDeals.filter(
          used => used.deal === card.docID,
        );
        let lastDealUsed = thisDealUsedArr
          .sort((used1, used2) => {
            return used1.usedOn.toDate() < used2.usedOn.toDate();
          })[0]
          .usedOn.toDate();
        const now = new Date();
        const daysSinceLastUse = (now - lastDealUsed) / (1000 * 60 * 60 * 24);
        console.log(daysSinceLastUse < cooldown);
        return daysSinceLastUse > cooldown;
      }
    }
  }
};
export const openNavigation = (address, uid, card) => {
  analytics()
    .logEvent(`navigate_to_${card.type}`, {
      uid,
      card: card.docID,
    })
    .then(() => console.log(`navigate_to_${card.type} logged`))
    .catch(err => console.log(err));
  openMap({
    end: address,
    navigate: true,
  });
};
export const useDeal = (card, user, setUser) => {
  const cooldown = card.deal.cooldown ? card.deal.cooldown : 0;
  Alert.alert(
    'Deal Redemption',
    `Please show this screen to an employee.\n\nThis deal is valid and is being redeemed now! This deal can be redeemed again ${
      cooldown === 0 ? 'immediately' : `in ${cooldown} days.`
    }\n\nIf you have any questions, please contact OcalaNow at (352)-445-0365`,
  );
  analytics()
    .logEvent('used_deal', {
      deal: card.docID,
      uid: user.uid,
    })
    .then(() => console.log('used_deal logged'));
  const now = firestore.Timestamp.now();
  const newUsed = {
    usedOn: now,
    deal: card.docID,
  };
  setUser(prevState => ({
    ...prevState,
    used: prevState.used ? [...prevState.used, newUsed] : [newUsed],
  }));
};
export const goToEvent = (card, user, setUser) => {
  analytics()
    .logEvent('going_to_event', {
      event: card.docID,
      uid: user.uid,
    })
    .then(() => console.log('going_to_event logged'));
  setUser(prevState => ({
    ...prevState,
    going: prevState.going ? [...prevState.going, card.docID] : [card.docID],
  }));
};
export const unGoToEvent = (card, user, setUser) => {
  analytics()
    .logEvent('ungo_to_event', {
      event: card.docID,
      uid: user.uid,
    })
    .then(() => console.log('ungo_to_event logged'));
  setUser(prevState => ({
    ...prevState,
    going: [
      ...prevState.going.slice(0, prevState.going.indexOf(card.docID)),
      ...prevState.going.slice(prevState.going.indexOf(card.docID) + 1),
    ],
  }));
};
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

export const getCardsByTag = tag => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('cards')
      .where('tags', 'array-contains', tag)
      .get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          resolve(
            querySnapshot.docs.map(doc => ({docID: doc.id, ...doc.data()})),
          );
        } else {
          resolve([]);
        }
      })
      .catch(err => reject(err));
  });
};

export const getCard = docID => {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('cards')
      .doc(docID)
      .get()
      .then(docSnapshot =>
        resolve({docID: docSnapshot.id, ...docSnapshot.data()}),
      )
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

export const getTagPic = tag => {
  return new Promise((resolve, reject) => {
    const asset = tag.replace(/\s+/g, '');
    console.log(asset);
    storage()
      .ref(`tags/${asset}.png`)
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

export const logEvent = (name, event) => {
  return new Promise((resolve, reject) => {
    analytics()
      .logEvent(name, event)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

// Messaging Functions
export const requestUserNotificationPermission = () => {
  return new Promise((resolve, reject) => {
    messaging()
      .requestPermission()
      .then(authStatus => {
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          resolve();
        } else {
          reject('Permssion denied');
        }
      })
      .catch(err => reject(err));
  });
};
export const updateMessagingToken = uid => {
  return new Promise((resolve, reject) => {
    messaging()
      .getToken()
      .then(token => {
        firestore()
          .collection('users')
          .doc(uid)
          .update({
            notificationToken: {
              token,
              updated: new Date(),
            },
          })
          .then(() => resolve())
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

// Dynamic Links Functions
export const shareCardLink = (card, uid) => {
  return new Promise((resolve, reject) => {
    let socialTitle = `Check out this ${
      card.type === 'info' ? 'place' : card.type
    } I found on OcalaNow!`;
    if (card.type === 'event') {
      socialTitle = `Check out ${card.title} on OcalaNow!`;
    } else if (card.type === 'deal') {
      socialTitle = `Check out this deal from ${card.subtitle} on OcalaNow!`;
    } else if (card.type === 'info') {
      socialTitle = `Check out ${card.title} on OcalaNow!`;
    }
    dynamicLinks()
      .buildShortLink(
        {
          link: `https://ocalanow.app/cards/${card.docID}`,
          domainUriPrefix: 'https://ocalanow.page.link',
          ios: {
            bundleId: 'matthewlamperski.OcalaNow',
            appStoreId: '1566738476',
            minimumVersion: '2.0',
          },
          android: {
            packageName: 'com.ocalanow',
          },
          social: {
            title: socialTitle,
            imageUrl: 'https://ocalanow.app/share.png',
          },
        },
        dynamicLinks.ShortLinkType.SHORT,
      )
      .then(link => {
        console.log('link', link);
        Share.open({
          message: socialTitle,
          url: link,
        })
          .then(() => {
            analytics()
              .logEvent('share_card', {
                card: card.docID,
                link,
                uid: uid,
              })
              .then(() => console.log('share_card logged'));
            resolve();
          })
          .catch(err => {
            console.log(JSON.stringify(err, null, 2));
            reject(err);
          });
      })
      .catch(err => reject(err));
  });
};

export const shareTagLink = (tag, uid) => {
  return new Promise((resolve, reject) => {
    let socialTitle = `Check out the ${tag} section on OcalaNow!`;
    dynamicLinks()
      .buildShortLink(
        {
          link: `https://ocalanow.app/tags/${tag}`,
          domainUriPrefix: 'https://ocalanow.page.link',
          ios: {
            bundleId: 'matthewlamperski.OcalaNow',
            appStoreId: '1566738476',
            minimumVersion: '2.0',
          },
          android: {
            packageName: 'com.ocalanow',
          },
          social: {
            title: socialTitle,
            imageUrl: 'https://ocalanow.app/share.png',
          },
        },
        dynamicLinks.ShortLinkType.SHORT,
      )
      .then(link => {
        console.log('link', link);
        Share.open({
          message: socialTitle,
          url: link,
        })
          .then(() => {
            analytics()
              .logEvent('share_tag', {
                card: tag,
                link,
                uid: uid,
              })
              .then(() => console.log('share_tag logged'));
            resolve();
          })
          .catch(err => {
            console.log(JSON.stringify(err, null, 2));
            reject(err);
          });
      })
      .catch(err => reject(err));
  });
};
