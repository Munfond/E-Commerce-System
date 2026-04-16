const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

exports.generateUrl = () => {
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: ['email', 'profile'].join(' '),
    };
    return `${oauth2Endpoint}?${new URLSearchParams(options).toString()}`;
}

exports.verifyGoogleCode = async (code) => {
    const { tokens } = await client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
}