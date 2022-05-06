import {extendTheme, themeTools} from 'native-base';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Platform} from 'react-native';

export const appTheme = extendTheme({
  colors: {
    primary: {
      50: '#fff7dc',
      100: '#fee7af',
      200: '#fbd781',
      300: '#f8c751',
      400: '#f8c70c',
      500: '#F5AF0A',
      600: '#ac7a03',
      700: '#7c5800',
      800: '#4b3500',
      900: '#1d1100',
    },
    secondary: {
      50: '#d7feff',
      100: '#aaf3ff',
      200: '#7aebff',
      300: '#48e1ff',
      400: '#1ad8ff',
      500: '#00bfe6',
      600: '#0094b4',
      700: '#006a82',
      800: '#004150',
      900: '#00171f',
    },
    background: {
      50: '#eceff1',
      100: '#cfd8dc',
      200: '#b0bec5',
      300: '#90a4ae',
      400: '#78909c',
      500: '#607d8b',
      600: '#546e7a',
      700: '#455a64',
      800: '#37474f',
      900: '#263238',
    },
  },
  components: {
    View: {
      baseStyle: (props: any) => {
        return {
          backgroundColor: themeTools.mode('muted.100', 'muted.800')(props),
        };
      },
    },
    Text: {
      baseStyle: (props: any) => {
        return {
          fontWeight: 100,
        };
      },
    },
    Button: {
      baseStyle: ({onButtonPress}) => {
        return {
          onPress: () => {
            console.log('Button Pressed');
            ReactNativeHapticFeedback.trigger(
              Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
            );
            if (onButtonPress) {
              onButtonPress();
            }
          },
        };
      },
      defaultProps: {
        p: 4,
        m: 3,
        shadow: 1,
        _text: {
          fontWeight: 300,
          fontSize: 'md',
        },
      },
      variants: {
        solid: () => {
          return {
            backgroundColor: 'primary.400',
            borderRadius: 10,
            _text: {fontWeight: 200, fontSize: 16},
            _pressed: {backgroundColor: 'primary.500'},
          };
        },
        subtle: {
          _text: {fontWeight: 200, fontSize: 'sm'},
        },
      },
    },
    ActionsheetItem: {
      baseStyle: (props: any) => {
        return {
          backgroundColor: themeTools.mode('muted.100', 'muted.700')(props),
          _text: {fontWeight: 200, fontSize: 'lg'},
          _pressed: {opacity: 0.7},
        };
      },
    },
    ActionsheetContent: {
      baseStyle: (props: any) => {
        return {
          backgroundColor: themeTools.mode('muted.100', 'muted.700')(props),
        };
      },
    },
    Input: {
      defaultProps: {
        borderWidth: 0,
        m: 2,
        borderRadius: 10,
        p: 4,
        py: 5,
        fontSize: 'md',
        fontWeight: 100,
        _light: {
          placeholderTextColor: 'muted.500',
        },
        _dark: {
          placeholderTextColor: 'muted.400',
        },
      },
      baseStyle: (props: any) => {
        return {
          backgroundColor: themeTools.mode('muted.200', 'muted.700')(props),
        };
      },
    },
  },
  shadows: {
    1: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10.84,
      elevation: 10,
    },
    2: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 10.84,
      elevation: 10,
    },
    3: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10.84,
      elevation: 10,
    },
  },
  fontConfig: {
    Trueno: {
      100: {
        normal: 'TruenoRg',
        italic: 'TruenoRgIt',
      },
      200: {
        normal: 'TruenoBd',
        italic: 'TruenoBdIt',
      },
      300: {
        normal: 'TruenoUltBlk',
        italic: 'TruenoUltBlkIt',
      },
    },
  },
  fonts: {
    heading: 'Trueno',
    body: 'Trueno',
    mono: 'Trueno',
  },
  config: {
    useSystemColorMode: true,
  },
});
