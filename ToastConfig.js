import {Box, HStack, Pressable, Text, theme, View, VStack} from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import React from 'react';

const colors = {
  primary: '#f5af0a',
};
export const toastConfig = {
  info: ({text1, text2, props, onPress}) => (
    <Pressable
      w="95%"
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}>
      <View
        rounded="lg"
        p={3}
        w="100%"
        shadow={9}
        bg={
          props.colorScheme === 'dark'
            ? theme.colors.dark['200']
            : theme.colors.light['100']
        }>
        <HStack justifyContent="center" alignItems="center">
          <Box pl={2} pr={4}>
            <FontAwesome5
              name="bell"
              size={28}
              solid
              color={theme.colors.lightBlue['500']}
            />
          </Box>
          <VStack flex={1}>
            <Text fontSize={16} fontWeight={300}>
              {text1}
            </Text>
            <Text noOfLines={3}>{text2}</Text>
          </VStack>
        </HStack>
      </View>
    </Pressable>
  ),
  error: ({text1, text2, props, onPress}) => (
    <Pressable
      w="95%"
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}>
      <View
        rounded="lg"
        p={3}
        w="100%"
        shadow={9}
        bg={
          props.colorScheme === 'dark'
            ? theme.colors.dark['200']
            : theme.colors.light['100']
        }>
        <HStack justifyContent="center" alignItems="center">
          <Box pl={2} pr={4}>
            <FontAwesome5
              name="exclamation-circle"
              size={28}
              color={theme.colors.error['500']}
            />
          </Box>
          <VStack flex={1}>
            <Text fontSize={16} fontWeight={300}>
              {text1}
            </Text>
            <Text noOfLines={3}>{text2}</Text>
          </VStack>
        </HStack>
      </View>
    </Pressable>
  ),
  message: ({text1, text2, props, onPress}) => (
    <View
      rounded="lg"
      p={3}
      w="95%"
      shadow={9}
      bg={
        props.colorScheme === 'dark'
          ? theme.colors.dark['200']
          : theme.colors.light['100']
      }>
      <HStack justifyContent="center" alignItems="center">
        <Box pl={2} pr={4}>
          <FontAwesome5 name="comment" size={28} solid color={colors.primary} />
        </Box>
        <VStack flex={1}>
          <Text fontSize={16} fontWeight={300}>
            {text1}
          </Text>
          <Text noOfLines={3}>{text2}</Text>
        </VStack>
      </HStack>
    </View>
  ),
};
