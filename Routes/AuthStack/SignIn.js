import React, {useContext, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  PresenceTransition,
  Pressable,
  Spinner,
  Text,
  useTheme,
  View,
  VStack,
} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import LogoHorizontal from '../../assets/svgs/LogoHorizontal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import GoogleLogo from '../../assets/svgs/GoogleLogo';
import AppleLogo from '../../assets/svgs/AppleLogo';
import {
  continueWithApple,
  continueWithGoogle,
  signInWithEmail,
} from '../../FireFunctions';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {AppContext} from '../../AppContext';

const SignIn = ({navigation}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const {top, bottom} = useSafeAreaInsets();
  const {setError} = useContext(AppContext);
  const validated = () => {
    if (email && password) {
      if (email.length === 0 || password.length === 0) {
        setError({
          title: 'Forms not complete',
          message: 'Please ensure all fields are filled.',
        });
        return false;
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        setError({
          title: 'Bad format',
          message: 'Please ensure your email is formatted correctly.',
        });
        return false;
      } else {
        return true;
      }
    } else {
      setError({
        title: 'Forms not complete',
        message: 'Please ensure all fields are filled.',
      });
      return false;
    }
  };
  const handleSignIn = () => {
    if (validated()) {
      setLoading(true);
      ReactNativeHapticFeedback.trigger(
        Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
      );
      signInWithEmail(email, password).catch(err => {
        setLoading(false);
        let notification = {
          title: 'Invalid login attempt!',
          message: 'Please try again later',
        };
        if (err.code === 'auth/invalid-email') {
          notification.message = 'That email address is not valid.';
        } else if (err.code === 'auth/user-disabled') {
          notification.message =
            'You have been disabled, contact support for more information.';
        } else if (err.code === 'auth/user-not-found') {
          notification.message = 'There is no user with that email.';
        } else if (err.code === 'auth/wrong-password') {
          notification.message =
            "Those credentials don't match with our system. (You may have signed up with Google)";
        }
        setError(notification);
      });
    }
  };
  const handleGoogleSignIn = () => {
    if (!googleLoading) {
      ReactNativeHapticFeedback.trigger(
        Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
      );
      setGoogleLoading(true);
      continueWithGoogle().catch(err => {
        setGoogleLoading(false);
        if (!err.code || err.code !== '-5') {
          setError({
            title: 'Error',
            message: `${err}`,
          });
        }
      });
    }
  };
  const handleAppleSignIn = () => {
    if (!appleLoading) {
      ReactNativeHapticFeedback.trigger(
        Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
      );
      setAppleLoading(true);
      continueWithApple().catch(err => {
        setAppleLoading(false);
        if (err.code !== '1001') {
          setError({
            title: 'Error signing you in',
            message: `Please try signing in another way. (You may have just canceled.) Error code: ${err.code}`,
          });
        }
      });
    }
  };
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const passwordRef = useRef(null);

  return (
    <LinearGradient
      colors={[theme.colors.primary['300'], theme.colors.primary['500']]}
      useAngle={true}
      angle={75}
      angleCenter={{x: 0.5, y: 0.5}}
      style={{flex: 1}}>
      <View bg="transparent" pt={top} flex={1}>
        <View bg="transparent" h="30%">
          <PresenceTransition
            flex={1}
            visible
            initial={{opacity: 0}}
            animate={{opacity: 1, transition: {duration: 500}}}>
            <View
              p={6}
              bg="transparent"
              justifyContent="center"
              alignItems="center"
              display="flex"
              flex={1}>
              <Text
                fontWeight={200}
                fontSize="md"
                _light={{color: 'muted.100'}}
                _dark={{color: 'muted.800'}}>
                Welcome back to
              </Text>
              <LogoHorizontal
                height="100%"
                width="100%"
                fill={
                  colorScheme === 'dark'
                    ? theme.colors.muted['800']
                    : theme.colors.muted['100']
                }
              />
            </View>
          </PresenceTransition>
        </View>
        <View
          shadow={9}
          flex={1}
          borderTopRightRadius={25}
          borderTopLeftRadius={25}>
          <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
            <VStack flex={1} p={3}>
              <Text pt={3} px={3} fontWeight={200} fontSize="2xl">
                Sign in to OcalaNow
              </Text>
              <Text
                px={3}
                fontSize="md"
                fontWeight={200}
                _dark={{color: 'muted.300'}}
                _light={{color: 'muted.400'}}>
                Experience Ocala.
              </Text>
              <VStack py={2}>
                <Input
                  InputLeftElement={
                    <Icon
                      as={<FontAwesome5 name="envelope" solid size={20} />}
                      size={4}
                      ml={5}
                    />
                  }
                  keyboardType="email-address"
                  returnKeyType="next"
                  placeholder="Enter email"
                  onSubmitEditing={() => {
                    passwordRef.current.focus();
                  }}
                  value={email ? email : ''}
                  onChangeText={text => setEmail(text.trim())}
                />
                <Input
                  type={showPassword ? 'default' : 'password'}
                  onChangeText={text => setPassword(text.trim())}
                  returnKeyType="go"
                  value={password ? password : ''}
                  InputLeftElement={
                    <Icon
                      as={<FontAwesome5 name="lock" solid size={20} />}
                      size={4}
                      ml={5}
                    />
                  }
                  InputRightElement={
                    <Pressable
                      p={5}
                      onPress={() => setShowPassword(!showPassword)}>
                      <FontAwesome5
                        name={showPassword ? 'eye-slash' : 'eye'}
                        solid
                        size={18}
                        color={
                          colorScheme === 'dark'
                            ? theme.colors.lightText
                            : theme.colors.darkText
                        }
                      />
                    </Pressable>
                  }
                  ref={passwordRef}
                  placeholder="Password"
                  onSubmitEditing={handleSignIn}
                />
                <Pressable
                  mx={3}
                  py={2}
                  px={2}
                  justifyContent="center"
                  alignItems="flex-end">
                  {({isPressed}) => (
                    <Text opacity={isPressed ? 0.3 : 1} color="primary.400">
                      Recover password
                    </Text>
                  )}
                </Pressable>
                <Box
                  style={{
                    flexDirection: 'row',
                    marginHorizontal: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    _light={{bg: 'darkText'}}
                    _dark={{bg: 'lightText'}}
                    style={{
                      height: 1,
                      flex: 1,
                      alignSelf: 'center',
                    }}
                  />
                  <Text
                    style={{
                      alignSelf: 'center',
                      paddingHorizontal: 5,
                      fontSize: 12,
                    }}>
                    or continue with
                  </Text>
                  <View
                    _light={{bg: 'darkText'}}
                    _dark={{bg: 'lightText'}}
                    style={{
                      height: 1,
                      flex: 1,
                      alignSelf: 'center',
                    }}
                  />
                </Box>
                <View
                  m={5}
                  flexDirection="row"
                  display="flex"
                  justifyContent="center"
                  alignItems="center">
                  <View style={styles.signInColumn}>
                    <TouchableOpacity
                      onPress={handleGoogleSignIn}
                      style={[
                        styles.signInTouchable,
                        {
                          backgroundColor:
                            theme.colors.muted[
                              colorScheme === 'dark' ? '700' : '100'
                            ],
                        },
                      ]}>
                      {googleLoading ? (
                        <View
                          bg="transparent"
                          justifyContent="center"
                          alignItems="center"
                          h={30}
                          w={30}>
                          <Spinner color="primary.500" />
                        </View>
                      ) : (
                        <HStack
                          space={2}
                          justifyContent="center"
                          alignItems="center">
                          <GoogleLogo height={25} width={25} />
                          {Platform.OS === 'android' && (
                            <Text fontSize={18} fontWeight={200}>
                              Google
                            </Text>
                          )}
                        </HStack>
                      )}
                    </TouchableOpacity>
                  </View>
                  {Platform.OS === 'ios' && (
                    <View style={styles.signInColumn}>
                      <TouchableOpacity
                        onPress={handleAppleSignIn}
                        style={[
                          styles.signInTouchable,
                          {
                            backgroundColor:
                              theme.colors.muted[
                                colorScheme === 'dark' ? '700' : '100'
                              ],
                          },
                        ]}>
                        {appleLoading ? (
                          <View
                            bg="transparent"
                            justifyContent="center"
                            alignItems="center"
                            h={30}
                            w={30}>
                            <Spinner color="primary.500" />
                          </View>
                        ) : (
                          <AppleLogo
                            fill={colorScheme === 'dark' ? 'white' : 'black'}
                            height={25}
                            width={25}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </VStack>
            </VStack>
          </KeyboardAwareScrollView>
          <View
            _dark={{
              borderTopWidth: 1,
              borderTopColor: 'muted.700',
            }}
            justifyContent="center"
            pb={Platform.select({ios: bottom, android: 3})}
            pt={3}
            shadow={9}>
            <Button
              isLoading={loading}
              isLoadingText="Signing you in..."
              mx={8}
              onPress={handleSignIn}>
              Sign In
            </Button>
            <TouchableOpacity
              style={{justifyContent: 'center', alignItems: 'center'}}
              onPress={() => {
                navigation.navigate('SignUp');
              }}>
              <Text underline>Don't have an account? Create one.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  signInColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },
  signInTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10.84,
    elevation: 10,
  },
});

export default SignIn;
