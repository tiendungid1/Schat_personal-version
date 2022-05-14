export function profileResponse(user, accessToken) {
    return {
        email: user.email,
        name: user.name,
        accessToken,
    };
}
