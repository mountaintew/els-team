import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { DialogContentText, AccordionDetails, AccordionSummary, Accordion, TableBody, DialogActions, DialogContent, Dialog, Paper, Toolbar, Link, AppBar, InputBase, Select, InputLabel, OutlinedInput, Avatar, Box, FormHelperText, Button, Card, CardContent, Container, CssBaseline, FormControl, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Slide, BottomNavigation, BottomNavigationAction } from '@material-ui/core'
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
import CloseIcon from '@material-ui/icons/Close';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import { DeviceHubRounded, ViewAgenda } from '@material-ui/icons';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import MessageRoundedIcon from '@material-ui/icons/MessageRounded';
import Maps from './Map'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { ExpandMore } from '@material-ui/icons';
// import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

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
    },
    appBar: {
        position: 'relative',
        backgroundColor: '#EEEEEE'
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },

}));


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const libraries = ["places"];

function Dashboard() {
    const classes = useStyles();
    const { currentUser, logout } = useAuth()
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    const dbRef = firebase.database();
    const [reports, setReports] = useState([])
    const [emailSent, setEmailSent] = useState(false)
    const [dialogEmailVerify, setDialogEmailVerify] = useState(true)
    const [barangayId, setBarangayId] = useState()
    const [dialogInfo, setDialogInfo] = useState(false)
    const [mapOpen, setMapOpen] = useState(false)
    const [resInfo, setResInfo] = useState()
    const [resCvdInfo, setResCvdInfo] = useState()
    const [resEmInfo, setResEmInfo] = useState()

    const [severity, setSeverity] = useState('error')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)

    const storage = firebase.storage();
    const storageRef = storage.ref('/images');
    const [imageUrl, setImageUrl] = useState(null)
    const [residentLoc, setResidentLoc] = useState()
    const [askOpen, setAskOpen] = useState(false)

    // if (loadError) return "Error loading map";
    // if (!isLoaded) return "Loading Map...";


    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    const closeEmailVerify = () => {
        setDialogEmailVerify(false);
    };

    const closeAsk = () => {
        setAskOpen(false)
    }

    const closeDialogInfo = () => {
        setDialogInfo(false);
        setResInfo();
        setResCvdInfo();
        setResEmInfo();
        setImageUrl(null);
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
                            if (v.state === "Reported") {
                                raw.push(v)
                            }
                        }
                    })
                    setReports(raw)
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
                    setBarangayId(barId)
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
                    setSearchResult(null)
                    setSnack(true)
                    setSeverity('error')
                    setSnackMessage('Resident not found.')
                }
            })
    }

    const rowcolor = (triage) => {
        switch (triage) {
            case "nurg":
                return '#CFD8DC'
                break;
            case "prio":
                return '#FFF59D'
                break;
            case "emer":
                return '#EF9A9A'
                break;

            default:
                return ''
                break;
        }
    }

    const StyledTableCell = withStyles((theme) => ({
        head: {
            backgroundColor: '#EBEBEB',
            color: theme.palette.common.black,
        },
        body: {
            fontSize: 12,
        },
    }))(TableCell);

    const getResData = (mobile) => {
        dbRef.ref('/Users/' + mobile + '/info').once('value').then((snapshot) => {
            if (snapshot.exists()) {
                let x = []
                x.push(snapshot.val())
                try {
                    storageRef.child(mobile).getDownloadURL()
                        .then((url) => {
                            // `url` is the download URL for 'images/stars.jpg'

                            // This can be downloaded directly:
                            var xhr = new XMLHttpRequest();
                            xhr.responseType = 'blob';
                            xhr.onload = (event) => {
                                var blob = xhr.response;
                            };
                            xhr.open('GET', url);
                            xhr.send();

                            setImageUrl(url);
                            console.log(url);
                        })
                        .catch((error) => {
                            setImageUrl('/profile-user.svg');
                        });
                } catch (error) {
                }
                setResInfo(x)
                console.log(x);
            }
        })

        dbRef.ref('/Users/' + mobile + '/info_covid_related').once('value').then((snapshot) => {
            if (snapshot.exists()) {
                let y = []
                y.push(snapshot.val())
                setResCvdInfo(y)
            }
        })

        dbRef.ref('/Markers/' + mobile).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                let z = []
                z.push(snapshot.val())
                setResEmInfo(z)
            }
        })
        //
        setDialogInfo(true)
    }

    const closeMap = () => {
        setMapOpen(false)
    }


    function viewLocation(lat, lng) {
        setMapOpen(true)
        setResidentLoc({ "lat": parseFloat(lat), "lng": parseFloat(lng) })
    }

    function setAsResponded() {
        setAskOpen(true)
    }

    const confirmRespond = () => {
        let number, dept
        Object.values(resInfo).map((v) => {
            number = v.number
            dept = v.dept
        })
        let state
        Object.values(resEmInfo).map((e) => {
            barangayId && dbRef.ref('/Archive/' + barangayId).push({
                "barangay_id": barangayId,
                "dept": e.dept,
                "details": e.details,
                "fullname": e.fullname,
                "lat": e.lat,
                "lng": e.lng,
                "locality": e.locality,
                "message": e.message,
                "mobile": e.mobile,
                "reportedBy": e.reportedBy,
                "reportedOn": e.reportedOn,
                "state": "Responded",
                "timestamp": e.timestamp,
                "toggled": e.toggled,
                "triage": e.triage

            }, (error) => {
                if (!error) {
                    number && dbRef.ref('/Markers/' + number + '/state').set('Responded', (error) => {
                        if (!error) {
                            closeDialogInfo()
                            closeAsk()
                            setSnack(true)
                            setSeverity('info')
                            setSnackMessage('Resident Responded')
                        }
                    })
                }
            })
        })



    }
    barangayId && console.log(barangayId);
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
                                <RoomRoundedIcon style={{ color: '#222222' }} />
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
                            <Container className={classes.containerAlt} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
                                <Grid container spacing={2} >
                                    <Grid item xs={12} md={8} lg={9} >
                                        <Paper className={classes.fixedHeightRes} elevation={0} style={{ backgroundColor: 'rgba(0,0,0,0)', borderRadius: '20px 20px 20px 20px' }}>
                                            <TableContainer component={Paper} style={{ minHeight: '100%', borderRadius: '15px', }}>
                                                <Table aria-label="reports table" size="small" stickyHeader >
                                                    <TableHead style={{ backgroundColor: '#fcbc20' }}>
                                                        <TableRow >
                                                            <StyledTableCell align="center">
                                                                View Details
                                                            </StyledTableCell>
                                                            <StyledTableCell align="left">
                                                                Resident Name
                                                            </StyledTableCell>
                                                            <StyledTableCell align="left">
                                                                Emergency
                                                            </StyledTableCell>
                                                            <StyledTableCell align="left">
                                                                Reported On
                                                            </StyledTableCell>
                                                            <StyledTableCell align="left">
                                                                Reported By
                                                            </StyledTableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {reports && Object.values(reports).map((val) =>
                                                            <TableRow key={val.mobile} hover style={{ backgroundColor: rowcolor(val.triage) }} >
                                                                {/* {setTriageIcon(val.triage)} */}
                                                                <TableCell align="center">
                                                                    <IconButton onClick={() => getResData(val.mobile)}>
                                                                        <VisibilityRoundedIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                                <TableCell align="left">
                                                                    {val.fullname + " (" + val.mobile + ")"}</TableCell>
                                                                <TableCell align="left">
                                                                    {val.details}
                                                                </TableCell>
                                                                <TableCell align="left">
                                                                    {new Date(val.timestamp).toLocaleString()}
                                                                </TableCell>
                                                                <TableCell align="left">
                                                                    {val.reportedBy}
                                                                </TableCell>
                                                            </TableRow>
                                                        )}

                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4} lg={3}>
                                        <Paper elevation={0} style={{
                                            minHeight: '150px',
                                            borderRadius: '15px',
                                            padding: '30px',
                                            backgroundColor: '#fafafa'
                                        }}>
                                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                                Current Reports
                                            </Typography>
                                            <Typography component="p" variant="h4">
                                                {reports.length}
                                            </Typography>
                                            <Typography color="textSecondary" className={classes.depositContext}>
                                                as of {new Date().toLocaleString('en-us', { month: 'long' }) + " " + new Date().getDate() + ", " + new Date().getFullYear()}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Container>

                            {/*                                 
                                <pre>
                                    {JSON.stringify(reports, null, 2)}
                                </pre> */}

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

                {
                    resInfo &&
                    <Dialog
                        open={dialogInfo}
                        onClose={closeDialogInfo}
                        fullScreen
                        TransitionComponent={Transition}
                    >

                        <AppBar className={classes.appBar} elevation={1}>
                            <Toolbar>
                                <IconButton edge="start" color="inherit" onClick={closeDialogInfo} aria-label="close">
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="h6" className={classes.title}>
                                    Resident Information
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <DialogTitle style={{ textAlign: 'center' }}>{
                            Object.values(resInfo).map((v) =>
                                <div>
                                    <Typography>
                                        {v.fullname}
                                        &nbsp;
                                        <Typography variant="caption" style={{ display: 'inline' }}>
                                            ({v.number})
                                        </Typography>
                                    </Typography>
                                </div>
                            )
                        }</DialogTitle>
                        <DialogContent >
                            <Avatar src={imageUrl && imageUrl} style={{
                                margin: 'auto',
                                width: '70px',
                                height: '70px',
                            }}></Avatar>
                            <br />

                            {resEmInfo && Object.values(resEmInfo).map((em) =>
                                <Grid
                                    container
                                    spacing={2}>

                                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                                        <Typography variant="caption">
                                            Emergency : {em.details}
                                        </Typography>
                                    </Grid>
                                    {em.message === "" ?
                                        '' :
                                        <Grid item xs={12} style={{ textAlign: 'center' }}>
                                            <TextField size="small" fullWidth disabled id="outlined-basic" label="Resident Message" variant="outlined" value={em.message} />
                                        </Grid>
                                    }
                                </Grid>
                            )}

                            {resInfo && Object.values(resInfo).map((info) =>
                                <div>
                                    <Grid
                                        container
                                        spacing={2}>
                                        <Grid item xs={12} style={{ textAlign: 'center' }}>
                                            <Link
                                                component="button"
                                                variant="body2"
                                                onClick={() => viewLocation(info.lat, info.lng)}
                                            >
                                                View Location
                                            </Link>
                                            <br />
                                            Last location sent on:<br />{new Date(info.timestamp).toLocaleString()}
                                        </Grid>
                                        <Grid item xs={4} style={{ textAlign: 'center' }}>
                                            <Typography variant="h6">
                                                {info.age > 0 ? info.age : 'Infant'}
                                            </Typography>
                                            <Typography variant="caption">
                                                Age
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} style={{ textAlign: 'center' }}>
                                            <Typography variant="h6">
                                                {info.bloodtype}
                                            </Typography>
                                            <Typography variant="caption">
                                                Blood Type
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} style={{ textAlign: 'center' }}>
                                            <Typography variant="h6">
                                                {info.sex}
                                            </Typography>
                                            <Typography variant="caption">
                                                Sex
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} style={{ textAlign: 'center' }}>
                                            <Typography variant="h6">
                                                {info.height}
                                            </Typography>
                                            <Typography variant="caption">
                                                Height
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} style={{ textAlign: 'center' }}>
                                            <Typography variant="h6">
                                                {info.weight}
                                            </Typography>
                                            <Typography variant="caption">
                                                Weight
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} style={{ textAlign: 'center' }}>
                                            <TextField fullWidth disabled id="outlined-basic" label="Allergies" variant="outlined" value={info.allergies} />
                                        </Grid>
                                        <Grid item xs={12} style={{ textAlign: 'center' }}>
                                            <TextField fullWidth disabled id="outlined-basic" label="Medical Conditions" variant="outlined" value={info.conditions} />
                                        </Grid>
                                        <Grid item xs={12} style={{ textAlign: 'center' }}>
                                            {info.mednotes === "n/a" ?
                                                <TextField fullWidth disabled id="outlined-basic" label="Medical Notes" variant="outlined" value={info.mednotes} />
                                                :
                                                <TextField multiline rows={4} fullWidth disabled id="outlined-basic" label="Medical Notes" variant="outlined" value={info.mednotes} />
                                            }
                                        </Grid>
                                    </Grid>

                                    {resCvdInfo && Object.values(resCvdInfo).map((cvd) =>
                                        <Grid container
                                            spacing={2}>
                                            <Grid item xs={12} style={{ textAlign: 'center' }}>
                                                <Typography variant="h6">
                                                    COVID-19 Related Information
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{ textAlign: 'center' }}>
                                                <TextField fullWidth disabled id="outlined-basic" label="Age Category" variant="outlined" value={cvd.ageCategory} />
                                            </Grid>
                                            <Grid item xs={12} style={{ textAlign: 'center' }}>
                                                <Typography>
                                                    {cvd.isFrontliner === "no" ? <p>This Resident is <b>not</b> a frontliner</p> : <p>This Resident is <b>a frontliner</b></p>}
                                                </Typography>
                                                <Typography>
                                                    {cvd.isVaccinated === "no" ? <p>This Resident <b>has not</b> been vaccinated</p> : <p>This Resident has been <b>vaccinated</b></p>}
                                                </Typography>
                                                <Typography>
                                                    {cvd.relativeHadCvd === "no" ? <p>This Resident <b>doesn't have a relative</b> who had COVID-19</p> : <p>This Resident <b>has a relative</b> who had COVID-19</p>}
                                                </Typography>
                                            </Grid>

                                        </Grid>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                        <BottomNavigation
                            // value={value}
                            // onChange={(event, newValue) => {
                            //     setValue(newValue);
                            // }}
                            showLabels
                            // className={classes.root}
                            style={{ backgroundColor: '#EEEEEE' }}
                        >
                            <BottomNavigationAction label="Send a Message" icon={<MessageRoundedIcon />} style={{ fontWeight: 'bold' }} />
                            <BottomNavigationAction onClick={() => setAsResponded()} label="Set as Responded" icon={<CheckRoundedIcon />} style={{ fontWeight: 'bold' }} />
                        </BottomNavigation>
                    </Dialog>
                }
                {/* mapOpen */}
                <Dialog
                    open={mapOpen}
                    onClose={() => closeMap()}
                    fullWidth={true}>

                    <DialogContent
                        style={{
                            padding: '0'
                        }}>
                        {residentLoc && <Maps location={residentLoc} />}

                    </DialogContent>
                </Dialog>

                <Dialog
                    open={askOpen}
                    onClose={() => closeAsk()}
                    fullWidth={true}>
                    <DialogTitle id="alert-dialog-slide-title">Confirmation</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            Are you sure you want to set this resident as reponded?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => closeAsk()} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => confirmRespond()} color="primary">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog ##################### */}
                <Dialog
                    fullWidth
                    open={openResultDialog}
                    onClose={closeResultDialog}
                    style={{
                        padding: '0'
                    }}>
                    <DialogTitle style={{ backgroundColor: '#eceff1' }}>
                        {searchResult && searchResult.length + ` matching result${searchResult.length > 1 ? 's' : ''}...`}
                    </DialogTitle>
                    <DialogContent style={{ backgroundColor: '#eceff1' }}>

                        {searchResult && searchResult.map((val) =>
                            <Accordion
                                key={val.number}
                                style={{ backgroundColor: '##cfd8dc' }}
                                expanded={expanded === val.number}
                                onChange={handleAccordionChange(val.number)}
                            >
                                <AccordionSummary elevation={0} expandIcon={<ExpandMore />}>
                                    <div style={{ alignItems: 'center', display: 'flex' }}>
                                        {val.state === "Safe" ? <FiberManualRecordIcon style={{ color: 'limegreen' }} /> : <FiberManualRecordIcon style={{ color: 'red' }} />}

                                        <Typography variant="caption">&nbsp;&nbsp;{val.firstname + " " + val.lastname}</Typography>
                                        <Typography variant="caption">&nbsp;&nbsp;({val.number})</Typography>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid>
                                        <Typography variant="subtitle2" component="p">
                                            Last Location Sent: {val.timestamp ? new Date(val.timestamp).toLocaleString() : 'Not known'}
                                        </Typography>
                                        <br />
                                        <Typography variant="caption" component="p">
                                            Sex: {val.sex}
                                            <br />
                                            Age: {val.age}
                                            <br />
                                            Height: {val.height}
                                            <br />
                                            Weight: {val.weight}
                                            <br />
                                            Blood Type: {val.bloodtype}
                                        </Typography>
                                        <br />
                                        <Typography variant="body2">
                                            Medical Conditions:
                                        </Typography>
                                        <Typography variant="caption">
                                            {val.conditions}
                                        </Typography>
                                        <br />
                                        <br />
                                        <Typography variant="body2">
                                            Allergies:
                                        </Typography>
                                        <Typography variant="caption">
                                            {val.allergies}
                                        </Typography>
                                        <br />
                                        <br />
                                        <Typography variant="body2">
                                            Medical Notes:
                                        </Typography>
                                        <Typography variant="caption">
                                            {val.mednotes}
                                        </Typography>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion >
                        )}
                    </DialogContent>
                </Dialog>
                {/* Dialog ##################### */}

            </div>
        </div>
    )
}

export default Dashboard
