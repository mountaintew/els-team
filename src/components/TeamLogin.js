import { CircularProgress, Select, InputLabel, OutlinedInput, Avatar, Box, FormHelperText, Button, Card, CardContent, Container, CssBaseline, FormControl, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography, MenuItem, SvgIcon } from '@material-ui/core'
import React, { useState, useEffect } from 'react'
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { amber, red } from '@material-ui/core/colors';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { useForm } from 'react-hook-form'
import QrReader from 'react-qr-reader2'
import { useAuth } from '../contexts/AuthContext'
import { useHistory, Link, useLocation } from 'react-router-dom'
import CropFreeRoundedIcon from '@material-ui/icons/CropFreeRounded';
import firebase, { provider } from '../util/firebase';
import GoogleIcon from '../search.svg'
import { Helmet } from 'react-helmet'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttonProgress: {
        color: amber,
        position: 'absolute',
        display: 'flex',
        position: 'end',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: '#fcbc20',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    wrapper: {
        position: 'relative',
    },
    cardbg: {
        backdropFilter: 'blur(5px)',
        backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(255,255,255,0.1))'
    },
    forgot: {
        color: "#424242"

    },
    login: {
        color: "#212121"
    },
    link: {
        textTransform: 'capitalize',
        color: '#222',
    },
    textField: {
        width: '25ch',
    },
}));

const previewStyle = {
    height: '100%',
    width: '100%',
    borderRadius: '5px',
    borer: '1px solid #90A4AE'
}

function TeamLogin() {
    const classes = useStyles();
    const { clearErrors, setError, watch, register, unregister, formState: { errors, isValid }, } = useForm({ mode: "all" });
    const [severity, setSeverity] = useState('')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const { login, currentUser } = useAuth()
    const dbRef = firebase.database();
    const history = useHistory()

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    const emailErr = () => {
        if (errors.email && errors.email.message === '') {
            return 'Please enter a valid email address.'
        }
        if (errors.email && errors.email.message !== '') {
            return errors.email.message
        }
    }

    async function completelogin() {
        await login(watch('email'), watch('password'))
        history.push("/")
    }

    function handleSubmit(e) {
        e.preventDefault()
        try {

            dbRef.ref('/teams').orderByChild('email').equalTo(watch('email')).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    completelogin()
                } else {
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Account doesn't exist.")
                    setSeverity("error")
                }
            })
        } catch (error) {
            switch (error.code) {
                case "auth/wrong-password":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Invalid Username or Password.")
                    setSeverity("error")
                    break;
                case "auth/too-many-requests":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Too many login attempts, try again later.")
                    setSeverity("error")
                    unregister("email", { keepDefaultValue: false })
                    unregister("password", { keepDefaultValue: false })
                    break;
                case "auth/user-not-found":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Account doesn't exist.")
                    setSeverity("error")
                    break;
                default:
            }
        }
    }


    return (
        <div>
            <div style={{
                background: 'url(/Wave.svg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}>
                <Helmet>
                    <title>{"Login"}</title>
                </Helmet>
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: '100vh' }}
                >
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />

                        <Card className={classes.cardbg} elevation={3} color='transparent'>
                            <CardContent>
                                <div className={classes.paper} >
                                    <Avatar className={classes.avatar}>
                                        <LocationOnIcon />
                                    </Avatar>
                                    <Typography component="h1" variant="h5">
                                        ELS Team
                                    </Typography>
                                    <form className={classes.form} noValidate autoComplete="off" onSubmit={(e) => handleSubmit(e)}>
                                        <Grid container spacing={2}>

                                            <Grid item xs={12}>
                                                <div style={{ position: 'relative' }}>
                                                    <TextField
                                                        id="email"
                                                        required
                                                        variant="outlined"
                                                        label="Email"
                                                        fullWidth
                                                        error={errors.email ? true : false}
                                                        name="email"
                                                        value={watch('email') ? watch('email') : ''}
                                                        {...register('email',
                                                            { required: true, pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }
                                                        )}
                                                        helperText={emailErr()}
                                                    />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="password"
                                                    id="password"
                                                    required
                                                    variant="outlined"
                                                    label="Password"
                                                    fullWidth
                                                    type="password"
                                                    value={watch('password') ? watch('password') : ''}
                                                    error={errors.password ? true : false}
                                                    {...register('password', { required: true })}

                                                />
                                            </Grid>
                                        </Grid>
                                        <div className={classes.wrapper} style={{ textAlign: 'center' }}>
                                            <Button
                                                disabled={!isValid}
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                            >
                                                Continue
                                            </Button>
                                            <Typography variant="caption" >
                                                No account? <span onClick={() => history.push('/teamcreate')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Create One!</span>
                                            </Typography>
                                        </div>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>

                    </Container>
                </Grid>
            </div>
            <Snackbar open={snack} autoHideDuration={4000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default TeamLogin
