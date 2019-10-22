module.exports = {
  _dbHandler: null,
  async findOrCreateGoogle(profile) {
    console.log('profile', profile);
    const isGoogleId = await this._dbHandler.isRecord('users', { google_id: profile.sub }, true);
    console.log('isGoogleId', isGoogleId);
    if (isGoogleId) return {name: isGoogleId.name, photo_url: isGoogleId.photo_url, google_id: isGoogleId.google_id};
    const insertGoogle = await this._dbHandler.insertRecord('users', { name: profile.name, photo_url: profile.picture, google_id: profile.sub, email:'something@gmail.com', password:'nopassword' });
    console.log('insertGoogle', insertGoogle);
    return { name: insertGoogle.rows[0].name, photo_url: insertGoogle.rows[0].photo_url, google_id: insertGoogle.rows[0].google_id, email: insertGoogle.rows[0].email };
  },
  set dbHandler(dbhandler) {
    this._dbHandler = dbhandler;
  }
};
