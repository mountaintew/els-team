import React, { useContext, useState, useEffect } from 'react'
import firebase, { auth } from '../util/firebase'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)


    function signinanon() {
        return auth.signInAnonymously()
    }

    function signup(email, password) {
        const promise = auth.createUserWithEmailAndPassword(email, password)
        promise.then(user => {
            user.sendEmailVerification();
        }).catch(error => console.log);
        return promise
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
    }

    function logout() {
        return auth.signOut()
    }

    function resetpassword(email) {
        return auth.sendPasswordResetEmail(email)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])


    const value = {
        currentUser,
        signup,
        login,
        logout,
        resetpassword,
        signinanon,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
