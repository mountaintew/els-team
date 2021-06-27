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

export default function Login() {
    const classes = useStyles();
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    const { clearErrors, setError, watch, register, unregister, formState: { errors, isValid }, } = useForm({ mode: "all" });
    const [severity, setSeverity] = useState('')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const [tfDisabled, setTfDisabled] = useState(false)
    const [readerOpen, setReaderOpen] = useState(false)
    const [BarangayId, setBarangayId] = useState()
    const { signup, currentUser } = useAuth()
    const history = useHistory()
    const dbRef = firebase.database();
    const [accepted, setAccepted] = useState(false)
    const [submitBtn, setSubmitBtn] = useState(false)
    const [facingMode, setFacingMode] = useState('user')
    const [checkMail, setCheckMail] = useState(false)



    useEffect(() => {
        if (parsed.barangayid !== undefined) {
            dbRef.ref('/administrators').orderByChild('barangay_id').equalTo(parsed.barangayid).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    Object.values(snapshot.val()).map((v) => {
                        setBarangayId(v.barangay_id)
                        setAccepted(true)
                        setSnack(true)
                        setSeverity('success')
                        setSnackMessage('Barangay ID accepted.')
                    })
                } else {
                    setSnack(true)
                    setSeverity('error')
                    setSnackMessage('Invalid Barangay ID')
                }
            })
        }
    }, [])

    const checkValue = () => {
        if (!isValid) {
            setSubmitBtn(true)
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    const handleError = (err) => {
        console.error(err)
    }

    const handleScan = (data) => {
        if (data !== null) {
            if (data.includes('barangayid')) {
                redirect(data)
            }
        }
    }

    const redirect = (data) => {
        window.location.href = data
        setReaderOpen(false)
    }


    const openQR = () => {
        setReaderOpen(true)
        unregister('barid',
            { keepValue: false }
        )
    }

    const checkCode = (e) => {
        e.preventDefault()
        watch('barangayid') && dbRef.ref('/administrators').orderByChild('barangay_id').equalTo(watch('barangayid')).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                Object.values(snapshot.val()).map((v) => {
                    setBarangayId(v.barangay_id)
                    setAccepted(true)
                    setSnack(true)
                    setSeverity('success')
                    setSnackMessage('Barangay ID accepted.')
                })
            } else {
                setSnack(true)
                setSeverity('error')
                setSnackMessage('Invalid Barangay ID')
            }
        })
    }
    const emailErr = () => {
        if (errors.email && errors.email.message === '') {
            return 'Please enter a valid email address.'
        }
        if (errors.email && errors.email.message !== '') {
            return errors.email.message
        }
    }

    async function forwardDashboard() {
        await signup(watch('email'), watch('password'))
        history.push("/")
    }

    function handleSubmit(e) {
        e.preventDefault()
        try {
            setCheckMail(true)
            dbRef.ref('/teams').orderByChild("email").equalTo(watch('email')).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    clearErrors("email")
                    setError("email", {
                        type: "manual",
                        message: "Email already exists."
                    });
                    setCheckMail(false)
                } else {
                    dbRef.ref('/administrators').orderByChild("email").equalTo(watch('email')).once('value').then((snapshot) => {
                        if (snapshot.exists()) {
                            clearErrors("email")
                            setError("email", {
                                type: "manual",
                                message: "Email already exists."
                            });
                            setCheckMail(false)
                        } else {
                            setCheckMail(false)

                            dbRef.ref('/administrators').orderByChild('barangay_id').equalTo(BarangayId).once('value').then((ss) => {
                                if (ss.exists()) {
                                    let barangay
                                    Object.values(ss.val()).map((v) => {
                                        barangay = v.barangay
                                    })


                                    dbRef.ref('/teams').push().set({
                                        'email': watch('email'),
                                        'barangay_id': BarangayId,
                                        'dept': watch('dept')
                                    }, (error) => {
                                        if (error) {
                                            setSnack(true)
                                            setSeverity('error')
                                            setSnackMessage('Sign Up failed.')
                                        } else {
                                            forwardDashboard()
                                        }
                                    })

                                }
                            })





                        }
                    })
                }
            }).catch((error) => {
                setSnack(true)
                setSeverity('error')
                setSnackMessage('Connection Lost.')
                setCheckMail(false)
            });
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
                    setTfDisabled(true)
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
        <div style={{
            background: 'url(/Wave.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        }}>
            <Helmet>
                <title>{"Create Account"}</title>
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
                                    {accepted ? 'Sign Up' : 'ELS Team'}
                                </Typography>

                                {/* onSubmit={handleSubmit} */}
                                {/* onSubmit={handleFormSubmit} */}

                                {accepted ?
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
                                                    {checkMail && <CircularProgress size={24} style={{ position: 'absolute', right: '5%', top: '30%', }} />}
                                                </div>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    disabled={tfDisabled}
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
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined"
                                                    fullWidth
                                                    error={errors.dept}>
                                                    <InputLabel id="select-dept-label">Select Department</InputLabel>
                                                    <Select
                                                        labelId="select-dept"
                                                        id="select-barangay"
                                                        label="Select Barangay"
                                                        defaultValue=""
                                                        {...register("dept", { required: true })}
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select Department</em>
                                                        </MenuItem>
                                                        <MenuItem value="bsf_dept">
                                                            Barangay Security Force
                                                        </MenuItem>
                                                        <MenuItem value="fire_dept">
                                                            Fire Department
                                                        </MenuItem>
                                                        <MenuItem value="health_dept">
                                                            Health Department
                                                        </MenuItem>
                                                        <MenuItem value="rrd_dept">
                                                            Risk Reduction Department
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                        <div className={classes.wrapper}>
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
                                        </div>
                                    </form>
                                    :
                                    <div>
                                        <form className={classes.form} noValidate autoComplete="off" onSubmit={(e) => checkCode(e)}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <FormControl variant="outlined" fullWidth>
                                                        <InputLabel>Barangay ID</InputLabel>
                                                        <OutlinedInput
                                                            id="barangayid"
                                                            required
                                                            variant="outlined"
                                                            label="Barangay ID"
                                                            error={errors.barid ? true : false}
                                                            name="barangayid"
                                                            value={watch('barangayid') ? watch('barangayid') : ''}
                                                            {...register("barangayid", { required: true })}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        edge="end"
                                                                        onClick={() => readerOpen ? setReaderOpen(false) : openQR()}
                                                                    >
                                                                        <CropFreeRoundedIcon />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                        />
                                                        <FormHelperText style={{ color: 'red' }}>{errors.barid && 'Please enter Barangay ID.'}</FormHelperText>
                                                    </FormControl>

                                                    {readerOpen ?
                                                        <Grid
                                                            style={{
                                                                marginTop: '20px',
                                                                textAlign: 'center'
                                                            }} item xs={12}>

                                                            <QrReader
                                                                delay={100}
                                                                style={previewStyle}
                                                                onError={handleError}
                                                                onScan={handleScan}
                                                                facingMode={facingMode}
                                                            />

                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}>Change camera</Button>
                                                        </Grid>


                                                        : ''}
                                                </Grid>


                                            </Grid>
                                            <div className={classes.wrapper}>
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
                                            </div>
                                        </form>
                                        <div className={classes.wrapper} style={{ textAlign: 'center', marginTop: '12px' }}>
                                            <Typography variant="caption">
                                                Already have an account? <span onClick={() => history.push('/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Login</span>
                                            </Typography>
                                        </div>
                                    </div>
                                }
                            </div>
                        </CardContent>
                    </Card>
                </Container>
            </Grid>
            <Snackbar open={snack} autoHideDuration={4000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}
