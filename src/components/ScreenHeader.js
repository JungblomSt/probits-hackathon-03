import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type } from '../theme';
import Icon from './Icon';

//Gemensam sidhuvud: knapp till vänster, rubrik i mitten , valfritt innehåll till höger
export default function ScreenHeader({ title, icon = 'back', onPress = () => router.back(), right }) {
    return (
        <View style={styles.header}>
            <Pressable
                accessibilityLabel={icon == 'close' ? 'Stäng' : 'Tillbaka'}
                onPress={onPress}
                style={styles.btn}
            >

                <Icon name={icon} strokeWidth={2} />
            </Pressable>
            <Text style={type.h2}>{title}</Text>
            <View style={styles.btn}>{right}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});