import React, {useRef, useState} from 'react';
import {
  Box,
  Button,
  Icon,
  Input,
  PresenceTransition,
  Pressable,
  ScrollView,
  Text,
  useTheme,
  View,
  VStack,
} from 'native-base';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {signUpWithEmail} from '../../FireFunctions';
import LinearGradient from 'react-native-linear-gradient';
import LogoHorizontal from '../../assets/svgs/LogoHorizontal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import GoogleLogo from '../../assets/svgs/GoogleLogo';
import AppleLogo from '../../assets/svgs/AppleLogo';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const SignUp = ({navigation}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const {top, bottom} = useSafeAreaInsets();
  const handleSignUp = () => {
    setLoading(true);
    ReactNativeHapticFeedback.trigger(
      Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
    );
    signUpWithEmail(email, password).catch(err => {
      setLoading(false);
      console.log(err);
    });
  };

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  return (
    <LinearGradient
      colors={[theme.colors.primary['300'], theme.colors.primary['500']]}
      useAngle={true}
      angle={75}
      angleCenter={{x: 0.5, y: 0.5}}
      style={{flex: 1}}>
      <View bg="transparent" position="relative" pt={top} flex={1}>
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
                Welcome to
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
          <ScrollView>
            <VStack p={3}>
              <Text pt={3} px={3} fontWeight={200} fontSize="2xl">
                Sign Up for OcalaNow
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
                  returnKeyType="next"
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
                  onSubmitEditing={() => {
                    confirmPassword.current.focus();
                  }}
                />
                <Input
                  ref={confirmRef}
                  type={showConfirm ? 'default' : 'password'}
                  onChangeText={text => setConfirmPassword(text.trim())}
                  returnKeyType="go"
                  value={confirmPassword ? confirmPassword : ''}
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
                      onPress={() => setShowConfirm(!showConfirm)}>
                      <FontAwesome5
                        name={showConfirm ? 'eye-slash' : 'eye'}
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
                  placeholder="Confirm password"
                  onSubmitEditing={handleSignUp}
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
                  p={3}
                  flexDirection="row"
                  display="flex"
                  justifyContent="center"
                  alignItems="center">
                  <View style={styles.signInColumn}>
                    <TouchableOpacity
                      style={[
                        styles.signInTouchable,
                        {
                          backgroundColor:
                            theme.colors.muted[
                              colorScheme === 'dark' ? '700' : '100'
                            ],
                        },
                      ]}>
                      <GoogleLogo height={30} width={30} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.signInColumn}>
                    <TouchableOpacity
                      style={[
                        styles.signInTouchable,
                        {
                          backgroundColor:
                            theme.colors.muted[
                              colorScheme === 'dark' ? '700' : '100'
                            ],
                        },
                      ]}>
                      <AppleLogo
                        fill={colorScheme === 'dark' ? 'white' : 'black'}
                        height={30}
                        width={30}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </VStack>
            </VStack>
          </ScrollView>
          <View
            _dark={{
              borderTopWidth: 1,
              borderTopColor: 'muted.700',
            }}
            justifyContent="center"
            pb={bottom}
            pt={3}
            shadow={9}>
            <Button mx={8} onPress={handleSignUp}>
              Sign Up
            </Button>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.goBack, {top: top}]}>
          <FontAwesome5
            size={20}
            color={colorScheme === 'dark' ? 'black' : 'white'}
            name="chevron-left"
          />
        </TouchableOpacity>
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
  goBack: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    padding: 15,
  },
});

export default SignUp;
