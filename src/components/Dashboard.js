import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { TableBody, DialogActions, DialogContent, Dialog, Paper, Toolbar, AppBar, InputBase, Select, InputLabel, OutlinedInput, Avatar, Box, FormHelperText, Button, Card, CardContent, Container, CssBaseline, FormControl, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell } from '@material-ui/core'
import firebase, { provider } from '../util/firebase';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { auth } from '../util/firebase'
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import MuiAlert from '@material-ui/lab/Alert';
import { DialogTitle } from '@material-ui/core';
import RoomRoundedIcon from '@material-ui/icons/RoomRounded';
import EmailRoundedIcon from '@material-ui/icons/EmailRounded';
import { Helmet } from 'react-helmet'
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
const BootstrapInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
    },
    input: {
        borderRadius: 4,
        position: 'relative',
        fontSize: 16,
        padding: '10px 26px 10px 12px',
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderRadius: 4,
        },
    },
}))(InputBase);


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        height: '100vh',
        background: 'url(/Wave.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',

    },
    toolbar: theme.mixins.toolbar,
    grow: {
        flexGrow: 1,
        display: 'flex'
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
    content: {
        flexGrow: 1,
        overflow: 'auto',
    },
    appBarSpacer: theme.mixins.toolbar,
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    containerAlt: {
        paddingBottom: theme.spacing(4),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },

    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
        display: 'flex',
        alignItems: 'center'
    },
    searchIcon: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },

    },
    bottomPush: {
        position: "fixed",
        bottom: 0,
        textAlign: "center",
        width: '250px',

    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },

    },
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
    fixedHeightRes: {
        height: 500,
    },
    fixedHeightMap: {
        height: 500,
    },
    formControl: {
        minWidth: 80,
    }
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Dashboard() {
    const classes = useStyles();
    const { currentUser, logout } = useAuth()
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    const dbRef = firebase.database();
    const [reports, setReports] = useState([])
    const [emailSent, setEmailSent] = useState(false)
    const [dialogEmailVerify, setDialogEmailVerify] = useState(true)

    const [severity, setSeverity] = useState('error')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    const closeEmailVerify = () => {
        setDialogEmailVerify(false);
    };

    useEffect(() => {

        const nry = (severity, text) => {
            setSnack(true)
            setSeverity(severity)
            setSnackMessage(text)
        };

        const addReports = (barId, department) => {
            barId && dbRef.ref('/Markers').orderByChild('barangay_id').equalTo(barId).on('value', (ss) => {

                if (ss.exists()) {

                    let raw = []
                    Object.values(ss.val()).map((v) => {
                        if (v.dept === department) {
                            raw.push(v)
                        }
                    })
                    setReports(raw)
                    currentUser.emailVerified && nry('info', raw.length + ` Current report${raw.length > 1 ? 's' : ''}.`)
                } else {
                    setReports([])
                    currentUser.emailVerified && nry('info', 'No reports yet.')
                }
            })
        }
        
        dbRef.ref("/teams").orderByChild('email').equalTo(currentUser.email).on('value', (snapshot) => {
            if (snapshot.exists()) {
                let barId, department
                Object.values(snapshot.val()).map((val) => {
                    barId = val.barangay_id
                    department = val.dept
                })
                barId && addReports(barId, department)
            }
        })

       



    }, [])

    var actionCodeSettings = {
        url: 'https://elms-accounts.web.app',
        handleCodeInApp: false
    };

    const authenticate = () => {
        firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
            .then(function () {
                // Verification email sent.
                window.localStorage.setItem('emailForSignIn', currentUser.email);
                // ...
                setSnack(true)
                setSeverity('success')
                setSnackMessage("Email sent.")
                setEmailSent(true)
            })
            .catch(function (error) {
                // Error occurred. Inspect error.code.
                var errorCode = error.code;
                var errorMessage = error.message;


                setEmailSent(false)
                setSnack(true)
                setSeverity('error')
                if (errorCode === "auth/too-many-requests") {
                    setSnackMessage("Too many email requests. Please try again later")
                } else {
                    setSnackMessage("Connection Lost.")
                }
            });
    }

    // Search By 
    const [searchBy, setSearchBy] = useState('lastname')
    const [searchPlaceholder, setSearchPlaceholder] = useState('Search...')
    const [searchTerm, setSearchTerm] = useState('')
    const [openResultDialog, setResultDialog] = useState(false)
    const [searchResult, setSearchResult] = useState(null)
    const [expanded, setExpanded] = React.useState(false);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleSearchBy = (e) => {
        setSearchBy(e.target.value)

        switch (e.target.value) {
            case 'number':
                setSearchPlaceholder('+63...')
                break
            case 'firstname':
                setSearchPlaceholder('Search by first name...')
                break
            case 'lastname':
                setSearchPlaceholder('Search by last name...')
                break
            case 'fullname':
                setSearchPlaceholder('Search by full name...')
                break
            default:
                setSearchPlaceholder('Search...')
        }
    }

    const handleSearchterm = (e) => {
        setSearchTerm(e.target.value)
    }

    const closeResultDialog = () => {
        setResultDialog(false)
    }

    const search = () => {
        searchTerm &&
            dbRef.ref('/Users').orderByChild('info/' + searchBy).equalTo(searchTerm).once('value').then((snapshot) => {
                if (snapshot.exists()) {

                    setSearchResult([Object.values(snapshot.val())[0].info])
                    setResultDialog(true)
                } else {
                    console.log('error');
                    //  setSearchResult(null)
                    //  setSnack(true)
                    //  setSeverity('error')
                    //  setSnackMessage('Resident not found.')
                }
            })
    }

    if (parsed.barangayid !== undefined) {
        console.log('there is a value');
    }

    const setTriageIcon = (triage) => {
        switch (triage) {
            case "nurg":
                return (<ErrorOutlineRoundedIcon style={{ color: '#4CAF50' }} />)
                break;
            case "prio":
                return (<ErrorRoundedIcon style={{ color: '#FFC107' }} />)
                break;
            case "emer":
                return (<WarningRoundedIcon style={{ color: '#E53935' }} />)
                break;

            default:
                return ''
                break;
        }
    }

    return (
        <div>
            <Helmet>
                <title>{"Dashboard"}</title>
            </Helmet>
            {/* SnackBar ##################### */}
            <Snackbar open={snack} autoHideDuration={4000} onClose={handleSnackClose}>
                <Alert onClose={handleSnackClose} severity={severity}>
                    {snackMessage}
                </Alert>
            </Snackbar>
            {/* SnackBar ##################### */}

            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="absolute" style={{ backgroundColor: 'rgba(207, 216, 220, 1)' }} elevation={0} >
                    <Container>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                            >
                                <RoomRoundedIcon style={{color: '#fafafa'}} />
                            </IconButton>
                            <div className={classes.search} >
                                <Button
                                    onClick={search}
                                    className={classes.searchIcon}
                                    style={{ borderRadius: '5px 0px 0px 5px', minWidth: '40px' }}
                                >
                                    <SearchIcon />
                                </Button>

                                <InputBase
                                    placeholder={searchPlaceholder}
                                    classes={{
                                        root: classes.inputRoot,
                                        input: classes.inputInput,
                                    }}
                                    inputProps={{ 'aria-label': 'search' }}
                                    onChange={handleSearchterm}
                                    value={searchTerm}
                                />

                                <FormControl className={classes.margin} >
                                    <Select

                                        value={searchBy}
                                        onChange={handleSearchBy}
                                        input={<BootstrapInput />}
                                        defaultValue={searchBy}
                                    >
                                        <MenuItem value={'fullname'}>Full Name</MenuItem>
                                        <MenuItem value={'firstname'}>First Name</MenuItem>
                                        <MenuItem value={'lastname'}>Last Name</MenuItem>
                                        <MenuItem value={'number'}>Mobile</MenuItem>
                                    </Select>
                                </FormControl>

                            </div>
                            <div className={classes.grow} />
                            <IconButton aria-label="signout" onClick={() => logout()}>
                                <ExitToAppRoundedIcon />
                            </IconButton>

                        </Toolbar>
                    </Container>
                </AppBar>
                <main className={classes.content} style={{ flexGrow: '1' }}>
                    <div className={classes.appBarSpacer} />
                    {/* <pre>
                        {JSON.stringify(currentUser, null, 2)}
                    </pre> */}
                    {currentUser.emailVerified === true ?

                        <div>
                            <Container>
                                <TableContainer component={Paper} style={{ minHeight: '80vh' }}>
                                    <Table aria-label="reports table" size="small" stickyHeader >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Functions</TableCell>
                                                <TableCell align="left">
                                                    Fullname
                                                </TableCell>
                                                <TableCell align="left">
                                                    Emergency
                                                </TableCell>
                                                <TableCell align="left">
                                                    Reported On
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody >
                                            {reports && Object.values(reports).map((val) =>
                                                <TableRow key={val.mobile}>
                                                    <TableCell component="th" scope="row" align="center">
                                                        {setTriageIcon(val.triage)}
                                                    </TableCell>
                                                    <TableCell align="left">{val.fullname + " (" + val.mobile + ")"}</TableCell>
                                                    <TableCell align="left">
                                                        {val.details}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {new Date(val.timestamp).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                        </TableBody>
                                    </Table>
                                </TableContainer>







                                {/*                                 
                                <pre>
                                    {JSON.stringify(reports, null, 2)}
                                </pre> */}
                            </Container>
                        </div>
                        :
                        ''
                    }
                </main>
                <Dialog
                    open={!currentUser.emailVerified}
                    onClose={closeEmailVerify}
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                >
                    {emailSent ? '' :
                        <DialogTitle style={{ textAlign: 'center' }}>
                            Email Verification
                        </DialogTitle>
                    }

                    <DialogContent style={{ textAlign: 'center' }}>
                        {emailSent ?
                            <div style={{ marginBottom: '20px' }}>
                                <Typography variant="body2" style={{ fontWeight: 'bold' }}>We've sent an email to
                                    <Typography variant="body2" style={{ color: 'limegreen' }}> {currentUser.email} </Typography>
                                    to confirm the validity of your email address.
                                </Typography>
                                <br />
                                <Typography variant="caption">After receiving the email, follow the link provided to complete your registration.</Typography>
                                <br />

                                <Typography variant="caption">Didn't recieve an email? <span onClick={() => window.location.reload()} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Click Here</span></Typography>
                            </div>
                            :
                            <div>
                                <Typography variant="caption" gutterBottom>
                                    To view barangay reports, verify your email by clicking the button below.
                                </Typography>
                                <br />
                                <br />
                            </div>
                        }

                    </DialogContent>
                    {emailSent ? '' :
                        <DialogActions>
                            <Button
                                variant="contained"
                                onClick={() => authenticate()}
                                color="primary"
                                fullWidth
                            >Send Verification Link</Button>
                        </DialogActions>
                    }
                </Dialog>



                {/* {console.log(JSON.stringify(currentUser, null, 2))} */}

                {/* db
                <br />
                {parsed.barangayid}
                <br />
                {parsed.dept}
                <br />
                <pre>
                    {JSON.stringify(reports, null, 2)}
                </pre>
                <Button
                    onClick={() => logout()}
                >Sign outs</Button> */}
            </div>
        </div>
    )
}

export default Dashboard
