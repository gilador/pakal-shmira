import { StyleSheet, TouchableOpacity } from 'react-native'

import React from 'react'

import { Text, View } from '../common/components/Themed'
import { RootStackScreenProps } from '../../types'

export default function NotFoundScreen({ navigation }: RootStackScreenProps<'NotFound'>) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>This screen doesn't exist.</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
})
