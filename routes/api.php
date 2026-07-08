<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Widget;

// Public widget endpoint — no auth required
Route::get('/widget/{uid}', function ($uid) {
	$widget = Widget::where('slug', $uid)->first();
	if (! $widget) {
		return response()->json(['content' => ''], 404);
	}
	return response()->json(['content' => $widget->content]);
});
@include('guestapi.php');

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
	return $request->user();
});

//Testing Purpose start

Route::get('/test', 'Api\TestController@test');
Route::get('/users', 'Api\TestController@index');

Route::get('/events', 'Api\TestController@events');

Route::get('/gallery', 'Api\TestController@gallery');

Route::get('/events/show/details/{id}', 'Api\EventsController@showdetails');

//end


//login
Route::post('/login', 'Api\LoginController@login');

//member web portal login (email-based; separate token namespace from the
//mobile app's LoginController@login so logging into one never logs the
//other out — see MemberAuthController for details)
Route::post('/member/login', 'Api\MemberAuthController@login');

Route::post('/member/logout', 'Api\MemberAuthController@logout')->middleware('auth:sanctum');

//admin console login (email-based; separate "admin-portal" token namespace
//so signing into the console never disturbs a member-portal or mobile-app
//session for the same user — see Api\Admin\AuthController for details)
Route::post('/admin/login', 'Api\Admin\AuthController@login');

Route::post('/admin/logout', 'Api\Admin\AuthController@logout')->middleware('auth:sanctum');

Route::get('/admin/me', 'Api\Admin\AuthController@me')->middleware('auth:sanctum');
//logout All Devices
Route::post('/logout/devices', 'Api\LoginController@logoutDevices');
//locations , churches list
Route::get('/locations', 'Api\ChurchController@locationList');

Route::get('/churches/{city_id}', 'Api\ChurchController@churchList');

//password reset

Route::post('/password/reset', 'Api\UserController@resetPassword');

Route::post('/password/store', 'Api\UserController@storePassword');

Route::post('/reset/check', 'Api\UserController@checkReset');

Route::post('/reset/change/password', 'Api\UserController@resetChangePassword');

//Route::get('/password/reset/form/{token}', 'Api\UserController@showResetForm');

//Route::post('/password/reset', 'Api\UserController@reset');

Route::group(
	['namespace' => 'Api', 'middleware' => ['auth:sanctum']],
	function () {
		Route::post('/logout', 'LoginController@logout');
	}
);

Route::group(
	[
		'prefix' => 'v1',
		'namespace' => 'Api',
		'middleware' => ['auth:sanctum']
	],
	function () {

		//Test Push Notification

		Route::post('/notification/create', 'TestController@notification');

		//members
		Route::get('/member/show', 'UserController@show');

		Route::get('/member/idcard', 'UserController@idcard');

		Route::post('/member/changePassword', 'UserController@changePassword');

		Route::post('/member/updatetoken', 'UserController@updatetoken');

		//Route::get('/member/resetPassword/{id}','UserController@resetPassword');

		Route::get('/member/get/marriage_status', 'UserprofileController@marriage_status');

		Route::get('/member/get/profession', 'UserprofileController@create');

		Route::get('/member/get/country', 'UserprofileController@country');

		Route::get('/member/get/state/{id}', 'UserprofileController@state');

		Route::get('/member/get/city/{id}', 'UserprofileController@city');


		Route::post('/member/edit', 'UserprofileController@update');
		Route::post('/member/editprofileimg', 'UserprofileController@updateprofileImg');
		Route::get('/member/activitylog', 'UserActivityLogController@index');



		//events

		Route::get('/event/show/{id}', 'EventsController@show');

		Route::get('/events/upcoming', 'EventsController@upcoming'); //upcoming events

		Route::get('/events/past', 'EventsController@past'); //past events

		Route::get('/events/gallery/show/{event_id}', 'EventGalleryController@showimage');

		//attendance (QR-based check-in)
		Route::get('/attendance/events',               'AttendanceController@myEvents');
		Route::post('/attendance/session',             'AttendanceController@openSession');
		Route::post('/attendance/scan',                'AttendanceController@scan');
		Route::post('/attendance/session/{id}/lock',   'AttendanceController@lock');
		Route::get('/attendance/session/{id}',         'AttendanceController@sessionReport');

		//gallery

		Route::get('/gallery/show/{church_id}', 'GalleryController@showdetails');

		Route::get('gallery/view/photos/{gallery_id}', 'PhotosController@showdetails');

		//sermons

		Route::post('sermon/like', 'VotesController@like');

		Route::post('sermon/unlike', 'VotesController@unlike');

		Route::post('sermon/favorite', 'FavoritesController@favorites');

		Route::get('sermon/view/{church_id}', 'SermonsController@index');

		Route::get('sermon/show/{sermons_id}', 'SermonLinkController@showdetails');

		//video

		Route::get('/mediaFiles', 'MediaFilesController@showvideo');

		//bulletins

		Route::get('/bulletin/show', 'BulletinsController@show');

		//fund
		Route::get('/myFunds', 'FundController@myFunds');

		Route::get('/fund/list', 'FundController@list');

		Route::post('/add/fund', 'FundController@store');

		Route::get('/paymentgateway', 'PayaccountContorller@getlist');

		Route::get('/payaccount/{gateway_id}', 'PayaccountContorller@showdetails');

		//donations (Next.js member portal — mirrors Member\DonationController)
		Route::get('/donate/gateways', 'DonationController@gateways');
		Route::get('/donate/history', 'DonationController@history');
		Route::get('/donate/status/{id}', 'DonationController@status');
		Route::post('/donate', 'DonationController@store');
		Route::post('/donate/verify', 'DonationController@verify');
		Route::post('/donate/mpesa-stk', 'DonationController@mpesaStk');
		Route::post('/donate/gcash-init', 'DonationController@gcashInit');
		Route::post('/donate/gcash-confirm', 'DonationController@gcashConfirm');
		Route::post('/donate/stripe-intent', 'DonationController@stripeIntent');

		//quotes

		Route::get('/quotes/show', 'QuotesController@index');

		//prayer_requests

		Route::get('/prayer_requests', 'PrayerRequestsController@index');

		Route::get('/prayer_requests/user', 'PrayerRequestsController@show');

		Route::get('/prayercategory/list', 'PrayerRequestsController@prayerCategory');

		Route::post('/prayer_requests/create', 'PrayerRequestsController@store');


		//prayer_participants

		Route::post('/prayer_participants/{id}', 'PrayerParticipantsController@store');

		Route::post('/prayer-requests/{id}/lift', 'PrayerRequestsController@lift');

		//helps

		Route::get('/helps', 'HelpsController@index');

		Route::get('/helps/user', 'HelpsController@show'); //my helps

		Route::post('/helps/create', 'HelpsController@store');

		Route::post('/helps/close/{id}', 'HelpsController@update');

		//groups

		Route::get('/groups/list', 'GroupsController@index');
		Route::post('/group/sendmessage/{group_id}', 'GroupsController@sendGroupMessage');
		Route::get('/grouppost/list/{group_id}', 'GroupsController@postindex');


		//messages

		Route::get('/messages', 'SendMessageController@index');

		Route::get('/notifications', 'SendMessageController@notificationList');
		Route::post('/notification/read/{id}', 'SendMessageController@readNotification');
		Route::post('/notification/allread', 'SendMessageController@allreadNotification');
		Route::post('/notification/bulkread', 'SendMessageController@bulkReadNotification');
		Route::post('/notification/bulkremove', 'SendMessageController@bulkRemoveNotification');

		Route::post('/message/read/{id}', 'SendMessageController@readMessage');

		Route::post('/church/contact', 'ContactController@userStore');

		//feedbacks

		Route::get('/feedbacks', 'FeedbackController@index');

		Route::get('/feedback/category/list', 'FeedbackController@list');

		Route::post('/feedback/add', 'FeedbackController@store');

		//church detail

		Route::get('/church/details/{church_id}', 'ChurchDetailsController@show');
	}
);

// Admin console (Next.js /console) — church admins (usergroup 3) and
// subadmins (usergroup 4) only. `churchadmin` reuses Auth::user(), which
// resolves correctly here since auth:sanctum runs first in the chain.
Route::group(
	[
		'prefix'     => 'admin',
		'namespace'  => 'Api\Admin',
		'middleware' => ['auth:sanctum', 'churchadmin'],
	],
	function () {
		Route::get('/dashboard', 'DashboardController@index');

		Route::get('/members', 'MemberController@index');
		Route::get('/members/{id}', 'MemberController@show');
		Route::post('/members', 'MemberController@store');
		Route::put('/members/{id}', 'MemberController@update');
		Route::patch('/members/{id}/status', 'MemberController@status');
		Route::delete('/members/{id}', 'MemberController@destroy');

		Route::get('/guests', 'GuestController@index');
		Route::get('/guests/{id}', 'GuestController@show');
		Route::post('/guests', 'GuestController@store');
		Route::put('/guests/{id}', 'GuestController@update');
		Route::patch('/guests/{id}/status', 'GuestController@status');
		Route::delete('/guests/{id}', 'GuestController@destroy');

		Route::get('/group-categories', 'GroupController@categories');
		Route::get('/groups', 'GroupController@index');
		Route::get('/groups/{id}', 'GroupController@show');
		Route::post('/groups', 'GroupController@store');
		Route::put('/groups/{id}', 'GroupController@update');
		Route::delete('/groups/{id}', 'GroupController@destroy');
		Route::get('/groups/{id}/members', 'GroupController@members');
		Route::get('/groups/{id}/available-members', 'GroupController@availableMembers');
		Route::post('/groups/{id}/members', 'GroupController@addMembers');
		Route::put('/groups/{id}/members/{linkId}', 'GroupController@updateMemberRole');
		Route::delete('/groups/{id}/members/{linkId}', 'GroupController@removeMember');
		Route::get('/groups/{id}/messages', 'GroupController@messages');
		Route::post('/groups/{id}/message', 'GroupController@message');

		Route::get('/subadmins', 'SubAdminController@index');
		Route::get('/subadmins/{id}', 'SubAdminController@show');
		Route::post('/subadmins', 'SubAdminController@store');
		Route::put('/subadmins/{id}', 'SubAdminController@update');
		Route::get('/subadmins/{id}/permissions', 'SubAdminController@getPermissions');
		Route::post('/subadmins/{id}/permissions', 'SubAdminController@updatePermissions');

		Route::get('/events', 'EventController@index');
		Route::post('/events', 'EventController@store');
		Route::get('/events/{id}', 'EventController@show');
		Route::put('/events/{id}', 'EventController@update');
		Route::delete('/events/{id}', 'EventController@destroy');
		Route::get('/events/{id}/photos', 'EventController@photos');
		Route::post('/events/{id}/photos', 'EventController@addPhoto');
		Route::delete('/events/{id}/photos/{photoId}', 'EventController@removePhoto');

		Route::get('/sermons', 'SermonController@index');
		Route::post('/sermons', 'SermonController@store');
		Route::get('/sermons/{id}', 'SermonController@show');
		Route::put('/sermons/{id}', 'SermonController@update');
		Route::delete('/sermons/{id}', 'SermonController@destroy');
		Route::get('/sermons/{id}/links', 'SermonController@links');
		Route::post('/sermons/{id}/links', 'SermonController@addLink');
		Route::delete('/sermons/{id}/links/{linkId}', 'SermonController@removeLink');

		Route::get('/bulletins', 'BulletinController@index');
		Route::post('/bulletins', 'BulletinController@store');
		Route::get('/bulletins/{id}', 'BulletinController@show');
		Route::delete('/bulletins/{id}', 'BulletinController@destroy');

		Route::get('/gallery', 'GalleryController@index');
		Route::post('/gallery', 'GalleryController@store');
		Route::get('/gallery/{id}', 'GalleryController@show');
		Route::put('/gallery/{id}', 'GalleryController@update');
		Route::delete('/gallery/{id}', 'GalleryController@destroy');
		Route::get('/gallery/{id}/photos', 'GalleryController@photos');
		Route::post('/gallery/{id}/photos', 'GalleryController@addPhoto');
		Route::delete('/gallery/{id}/photos/{photoId}', 'GalleryController@removePhoto');

		Route::get('/quotes', 'QuoteController@index');
		Route::post('/quotes', 'QuoteController@store');
		Route::get('/quotes/{id}', 'QuoteController@show');
		Route::put('/quotes/{id}', 'QuoteController@update');
		Route::post('/quotes/{id}/reschedule', 'QuoteController@reschedule');
		Route::delete('/quotes/{id}', 'QuoteController@destroy');

		Route::get('/prayer-board', 'PrayerController@index');
		Route::get('/prayer-board/{id}', 'PrayerController@show');
		Route::post('/prayer-board/{id}/approve', 'PrayerController@approve');
		Route::post('/prayer-board/{id}/reject', 'PrayerController@reject');
		Route::post('/prayer-board/{id}/mark-answered', 'PrayerController@markAnswered');
		Route::post('/prayer-board/{id}/pin', 'PrayerController@pin');
		Route::post('/prayer-board/{id}/unpin', 'PrayerController@unpin');
		Route::post('/prayer-board/{id}/extend', 'PrayerController@extend');
		Route::post('/prayer-board/{id}/unpublish', 'PrayerController@unpublish');

		Route::get('/prayer-categories', 'PrayerCategoryController@index');
		Route::post('/prayer-categories', 'PrayerCategoryController@store');
		Route::put('/prayer-categories/{id}', 'PrayerCategoryController@update');
		Route::delete('/prayer-categories/{id}', 'PrayerCategoryController@destroy');

		Route::get('/helps', 'HelpController@index');
		Route::get('/helps/{id}', 'HelpController@show');
		Route::put('/helps/{id}', 'HelpController@update');

		Route::get('/feedbacks', 'FeedbackController@index');
		Route::get('/feedbacks/{id}', 'FeedbackController@show');
		Route::post('/feedbacks/messages/{id}/status', 'FeedbackController@updateMessageStatus');

		Route::get('/contacts', 'ContactController@index');
		Route::get('/contacts/{id}', 'ContactController@show');

		Route::get('/funds', 'FundController@index');
		Route::get('/funds/members', 'FundController@members');
		Route::post('/funds', 'FundController@store');
		Route::get('/funds/{id}', 'FundController@show');
		Route::put('/funds/{id}', 'FundController@update');
		Route::delete('/funds/{id}', 'FundController@destroy');

		Route::get('/donations', 'DonationController@index');
		Route::get('/donations/{id}', 'DonationController@show');
		Route::patch('/donations/{id}/status', 'DonationController@updateStatus');
		Route::delete('/donations/{id}', 'DonationController@destroy');

		Route::get('/payment-gateways', 'PaymentgatewayController@index');

		Route::get('/payaccounts', 'PayaccountController@index');
		Route::post('/payaccounts', 'PayaccountController@store');
		Route::get('/payaccounts/{id}', 'PayaccountController@show');
		Route::put('/payaccounts/{id}', 'PayaccountController@update');
		Route::patch('/payaccounts/{id}/status', 'PayaccountController@statusUpdate');
		Route::delete('/payaccounts/{id}', 'PayaccountController@destroy');

		Route::get('/messages', 'MessageController@index');
		Route::get('/messages/recipients', 'MessageController@recipients');
		Route::post('/messages/send', 'MessageController@send');
		Route::get('/messages/{batchId}', 'MessageController@show');

		Route::get('/mailing-lists', 'MailinglistController@index');
		Route::post('/mailing-lists', 'MailinglistController@store');
		Route::get('/mailing-lists/{id}', 'MailinglistController@show');
		Route::put('/mailing-lists/{id}', 'MailinglistController@update');
		Route::delete('/mailing-lists/{id}', 'MailinglistController@destroy');
		Route::get('/mailing-lists/{id}/subscribers', 'MailinglistController@subscribers');

		Route::get('/subscribers', 'SubscriberController@index');
		Route::post('/subscribers', 'SubscriberController@store');
		Route::delete('/subscribers/{id}', 'SubscriberController@destroy');
		Route::post('/subscribers/attach', 'SubscriberController@attach');
		Route::delete('/subscribers/detach/{linkId}', 'SubscriberController@detach');

		Route::get('/campaigns', 'CampaignController@index');
		Route::post('/campaigns', 'CampaignController@store');
		Route::get('/campaigns/{id}', 'CampaignController@show');
		Route::put('/campaigns/{id}', 'CampaignController@update');
		Route::delete('/campaigns/{id}', 'CampaignController@destroy');

		Route::get('/page-categories', 'PageCategoryController@index');
		Route::post('/page-categories', 'PageCategoryController@store');
		Route::put('/page-categories/{id}', 'PageCategoryController@update');
		Route::delete('/page-categories/{id}', 'PageCategoryController@destroy');

		Route::get('/pages', 'PageController@index');
		Route::post('/pages', 'PageController@store');
		Route::get('/pages/{id}', 'PageController@show');
		Route::put('/pages/{id}', 'PageController@update');
		Route::delete('/pages/{id}', 'PageController@destroy');
		Route::get('/pages/{id}/versions', 'PageController@versions');
		Route::post('/pages/{id}/versions/{versionId}/revert', 'PageController@revertVersion');

		Route::get('/post-categories', 'PostCategoryController@index');
		Route::post('/post-categories', 'PostCategoryController@store');
		Route::put('/post-categories/{id}', 'PostCategoryController@update');
		Route::delete('/post-categories/{id}', 'PostCategoryController@destroy');

		Route::get('/posts', 'PostController@index');
		Route::post('/posts', 'PostController@store');
		Route::get('/posts/{id}', 'PostController@show');
		Route::put('/posts/{id}', 'PostController@update');
		Route::delete('/posts/{id}', 'PostController@destroy');

		Route::get('/faq-categories', 'FaqCategoryController@index');
		Route::post('/faq-categories', 'FaqCategoryController@store');
		Route::put('/faq-categories/{id}', 'FaqCategoryController@update');
		Route::delete('/faq-categories/{id}', 'FaqCategoryController@destroy');

		Route::get('/faq', 'FaqController@index');
		Route::post('/faq', 'FaqController@store');
		Route::get('/faq/{id}', 'FaqController@show');
		Route::put('/faq/{id}', 'FaqController@update');
		Route::delete('/faq/{id}', 'FaqController@destroy');

		Route::get('/widgets', 'WidgetController@index');
		Route::post('/widgets', 'WidgetController@store');
		Route::get('/widgets/{id}', 'WidgetController@show');
		Route::put('/widgets/{id}', 'WidgetController@update');
		Route::delete('/widgets/{id}', 'WidgetController@destroy');

		Route::post('/profile/password', 'ProfileController@updatePassword');
		Route::post('/profile/avatar', 'ProfileController@updateAvatar');

		Route::get('/church-settings', 'ChurchSettingsController@index');
		Route::post('/church-settings', 'ChurchSettingsController@update');

		Route::get('/countries', 'MasterDataController@countries');
		Route::get('/states', 'MasterDataController@states');
		Route::get('/cities', 'MasterDataController@cities');

		// Master data management (legacy Admin\MasterData\* parity)
		Route::get('/masterdata/countries', 'MasterDataController@manageCountries');
		Route::post('/masterdata/countries', 'MasterDataController@storeCountry');
		Route::put('/masterdata/countries/{id}', 'MasterDataController@updateCountry');
		Route::delete('/masterdata/countries/{id}', 'MasterDataController@destroyCountry');
		Route::get('/masterdata/states', 'MasterDataController@manageStates');
		Route::post('/masterdata/states', 'MasterDataController@storeState');
		Route::put('/masterdata/states/{id}', 'MasterDataController@updateState');
		Route::delete('/masterdata/states/{id}', 'MasterDataController@destroyState');
		Route::get('/masterdata/cities', 'MasterDataController@manageCities');
		Route::post('/masterdata/cities', 'MasterDataController@storeCity');
		Route::put('/masterdata/cities/{id}', 'MasterDataController@updateCity');
		Route::delete('/masterdata/cities/{id}', 'MasterDataController@destroyCity');

		// Payment gateway management (legacy Admin\Payment\PaymentgatewayController parity)
		Route::get('/paymentgateways/manage', 'PaymentgatewayController@manage');
		Route::post('/paymentgateways', 'PaymentgatewayController@store');
		Route::put('/paymentgateways/{id}', 'PaymentgatewayController@update');
		Route::patch('/paymentgateways/{id}/status', 'PaymentgatewayController@status');
		Route::delete('/paymentgateways/{id}', 'PaymentgatewayController@destroy');

		// Media library (legacy MediaFiles/Video/Audio/ImageController parity)
		Route::get('/mediafiles', 'MediaFileController@index');
		Route::post('/mediafiles', 'MediaFileController@store');
		Route::delete('/mediafiles/{id}', 'MediaFileController@destroy');

		// Email Blaster (legacy Email/NewsLetter/Smtp/MailQueue/EmailBlaster\* parity)
		Route::get('/emails', 'EmailTemplateController@index');
		Route::post('/emails', 'EmailTemplateController@store');
		Route::get('/emails/{id}', 'EmailTemplateController@show');
		Route::put('/emails/{id}', 'EmailTemplateController@update');
		Route::delete('/emails/{id}', 'EmailTemplateController@destroy');

		Route::get('/newsletter', 'NewsletterController@index');
		Route::post('/newsletter/send', 'NewsletterController@store');

		Route::get('/smtps', 'SmtpController@index');
		Route::post('/smtps', 'SmtpController@store');
		Route::get('/smtps/{id}', 'SmtpController@show');
		Route::put('/smtps/{id}', 'SmtpController@update');
		Route::delete('/smtps/{id}', 'SmtpController@destroy');

		Route::get('/mailqueues', 'MailQueueController@index');
		Route::get('/mailqueues/{id}', 'MailQueueController@show');
		Route::put('/mailqueues/{id}', 'MailQueueController@update');
		Route::delete('/mailqueues/{id}', 'MailQueueController@destroy');

		Route::get('/rules', 'RuleController@index');
		Route::post('/rules', 'RuleController@store');
		Route::put('/rules/{id}', 'RuleController@update');
		Route::delete('/rules/{id}', 'RuleController@destroy');

		Route::get('/webhooks', 'WebhookController@index');
		Route::post('/webhooks', 'WebhookController@store');
		Route::put('/webhooks/{id}', 'WebhookController@update');
		Route::delete('/webhooks/{id}', 'WebhookController@destroy');

		Route::get('/analytics', 'AnalyticsController@index');

		Route::get('/reports/export', 'ReportController@exportMembers');

		Route::get('/activity-log', 'ActivityLogController@index');
	}
);
