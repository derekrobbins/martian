import { Plug } from 'mindtouch-http/plug.js';
import { Settings } from './lib/settings.js';
import { utility } from './lib/utility.js';
import { modelParser } from './lib/modelParser.js';
import { userActivityModel } from './models/userActivity.model.js';
import { userHistoryModel } from './models/userHistory.model.js';
import { userHistoryDetailModel } from './models/userHistoryDetail.model.js';
import { pageHistoryModel } from './models/pageHistory.model.js';

/**
 * A class for fetching and managing events.
 */
export class Events {

    /**
     * Construct a new Events object.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this.settings = settings;
        this.plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'events');
    }

    /**
     * Get the user activity.
     * @param {Number|String} userActivityToken - A token that identifies the user from an user activity perspective. It can be the user's numeric ID, username, or another system-defined token.
     * @returns {Promise.<userActivityModel>} - A Promise that, when resolved, yields a {@link userActivityModel} containing the user's activity events.
     */
    getUserActivity(userActivityToken, params) {
        const token = utility.getNormalizedUserActivityToken(userActivityToken);
        const userActivityModelParser = modelParser.createParser(userActivityModel);
        return this.plug.at('support-agent', token).withParams(params).get().then((r) => r.json()).then(userActivityModelParser);
    }

    /**
     * Get the user's history events.
     * @param {Number|String} [userId='current'] - The user's numeric ID or username.
     * @returns {Promise.<userHistoryModel>} - A Promise that, when resolved, yields a {@link userHistoryModel} that contains the listing of the user's events.
     */
    getUserHistory(userId) {
        const userHistoryModelParser = modelParser.createParser(userHistoryModel);
        return this.plug.at('user-page', utility.getResourceId(userId, 'current')).get().then((r) => r.json()).then(userHistoryModelParser);
    }

    /**
     * Get the details of a specific user event.
     * @param {Number|String} [userId='current'] - The user's numeric ID or username.
     * @param {String} detailId - The detail ID of the event.
     * @returns {Promise.<userHistoryDetailModel>} - A Promise that, when resolved, yields a {@link userHistoryDetailModel} that contains the event information.
     */
    getUserHistoryDetail(userId, detailId) {
        const userHistoryDetailModelParser = modelParser.createParser(userHistoryDetailModel);
        return this.plug.at('user-page', utility.getResourceId(userId, 'current'), detailId).get().then((r) => r.json()).then(userHistoryDetailModelParser);
    }

    /**
     * Get page history summary.
     * @param {Number|String} [id='home'] - The page ID or path.
     * @returns {Promise.<pageHistoryModel>} - A Promise that, when resolved, yields a {@link pageHistoryModel} that contains the listing of the page events.
     */
    getPageHistory(pageId) {
        const pageHistoryModelParser = modelParser.createParser(pageHistoryModel);
        return this.plug.at('page', utility.getResourceId(pageId, 'home')).get().then((r) => r.json()).then(pageHistoryModelParser);
    }

    /**
     * Log a search event that is performed by a specific user.
     * @param {Number|String} [userId='current'] - The user's numeric ID or username.
     * @param {Object} eventData - Specific data about the search that was performed.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful posting of the search event.
     */
    logSearch(userId, eventData) {
        return this.plug.at('search', utility.getResourceId(userId, 'current')).post(JSON.stringify(eventData), utility.jsonRequestType);
    }

    /**
     * Log a web widget impression event. This request will fail if not called from a MindTouch web widget.
     * @returns {Promise} - A Promise that, when resolved, contains the status of the web widget impression request.
     */
    logWebWidgetImpression() {
        return this.plug.at('web-widget-impression').post();
    }
}