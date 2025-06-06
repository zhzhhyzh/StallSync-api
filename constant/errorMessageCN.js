const USERNAMEISREQUIRED = '请输入用户名'; //'Username is required';  
const PASSWORDISREQUIRED = '请输入密码'; //'Password is required';  
const INVALIDKEY = 'API密钥无效'; //'Invalid API Key';  
const USERALREADYEXIST = '用户名已被使用'; //"Username already in use";  
const LOGINFAILED = '登录失败。请联系管理员'; //"Login Failed. Please Contact Administrator";  
const INCORRECTPASS = '用户名或密码不正确'; //"Incorrect username or password";  
const USERNOTFOUND = '未找到用户'; //"User not found";  
const NAMEISREQUIRED = '请输入您的名字'; //"Name is required";  
const NORECORDFOUND = '未找到记录'; //"Record not found";  
const RECORDEXISTS = '记录已存在'; //"Record already exists";  
const CURRENTPASSWORDISREQUIRED = '请输入当前密码'; //"Current password is required";  
const NEWPASSWORDISREQUIRED = '请输入新密码'; //"New password is required";  
const CONFIRMPASSWORDISREQUIRED = '请输入确认密码'; //"Confirm password is required"; 
const PASSWORDMISMATCH = '新密码和确认密码不相符'; //"New Password and Confirm Password does not match"; 
const IDNPASSWORDSAME = '您的用户名和密码太相似，请换个新密码'; //"Your username and password is too similar, change a new password"; 
const EMAILISREQUIRED = '请输入电子邮件'; //"Email Address is required"; 
const UNAUTHORIZED = '未经授权访问'; //"Unauthorized Access"; 
const APINOTFOUND = '未找到API'; //"API Not found"; 
const UNEXPECTEDERROR = '发生意外错误。请联系管理员'; //"Unexpected error occurred. please contact administrator"; 
const FIELDISREQUIRED = '请输入字段'; //"Field is Required"; 
const INVALIDVALUELENGTH = '无效值长度 - 最大和长度字符'; //"Invalid Value Length - Maximum & length Characters"; 
const MAXDOCUMENTUPLOAD = '最大可上传文件量超过 - 最大和长度文件'; //"Maximum Uploadable Document Exceed - Maximum & length File"; 
const INVALIDFILELENGTH = '上传的文件长度无效 - 最大和长度 MB'; //"Invalid Uploaded Document Length - Maximum & length MB"; 
const INVALIDFILETYPE = '上传的文档类型无效'; //"Invalid Uploaded Document Type"; 
const DOCUMENTNOTFOUND = '未找到搜索的文件'; //"Document Searched Not Found";
const FUTUREDATE = '日期不能是未来的日期'; //"Date Cannot Be Future Date"; 
const PASTDATE = '日期不能是过去的日期'; //"Date Cannot be Past Date"; 
const MISSINGDOCUMENT = '缺少一份或多份文件'; //"One or More Document is/are Missing"; 
const DOCUMENTISREQUIRED = '请上载相关文件'; //"Document is Required"; 
const INVALIDDATAVALUE = '无效的数据值'; //"Invalid Data Value"; 
const INVALIDAUTHORITY = '无权执行此操作'; //"Invalid Authority To Perform This Action"; 
const INVALIDSTATUS = '无效状态以执行当前操作'; //"Invalid Status to Perform Current Action"; 
const INVALIDRECEIVER = '一个或多个收件人的电子邮件无效'; //"One or more Receiver Email Address is Invalid"; 
const INVALIDCCRECEIVER = '一个或多个抄送的电子邮件无效'; //"One or more CC Email Address is Invalid" 
const RECORDIDISREQUIRED = '请输入系统记录ID'; //"Sytem Record ID is Required"; 
const MULTIPLELOGIN = '账户已在其他设备登录'; //"Account Logged On From Other Device"; 
const INVALIDPASSWORD = '当前密码 不正确'; //"Current Password is Incorrect"; 
const PASSWORDCANNOTSAME = '新密码不能与当前密码相同'; //"New Password Cannot be Same with Current Password"; 
const PASSWORDMNOTMATCH = '新密码和确认密码必须相同'; //"New Password & Confirm Password Must be Same"; 
const MEMBEREXPIRED = '您的会员资格已失效，请联系管理员以获取帮助'; //"Your Membership Has Been Expired, Please Contact Admin for Further Assistance"; 
const RESETUSED = '重置密码请求已失效，请重新申请'; //"Reset Password Request already expired, please request a new one"; 
const INVALIDRESETUID = '重置密码请求无效，请通过忘记密码发送新的请求'; //"Invalid Reset Password Request, Please send a new request via Forget Password";
const UPDATEFAILED = '记录更新失败，请联系管理员'; //"Failed to Update Record, Please Contact Administrator";
const ACCOUNTCLOSED = '帐户已被关闭，请联系客户服务以进一步查询'; //"Account Has Been Closed, Please Contact Customer Service for Further Inquiry";
const ACCOUNTLOCKED = '帐户已被锁定，请联系客户服务以进一步查询'; //"Account Has Been Locked, Please Contact Customer Service for Further Inquiry";
const RESETDENIED = '该账户已被关闭。密码重置请求已拒绝'; //"This account has been closed. Password reset request denied";
const INVALIDVALUELENGTHMIN = '无效值长度 - 最小和长度字符'; //"Invalid Value Length - Minimum &length Characters";
const REPORTTYPEISREQUIRED = '请选择报告类型'; //"Report Type is Required";
const INVALIDDATERANGE = '无效日期范围。当前日期不能大于起始日期'; //"Invalid Date Range. To Date cannot be greater than From Date";
const INVALIDOTP = '无效验证码，再次请求验证码进行验证。'; //"Invalid OTP, Please Request OTP to perform Verification Before Proceed";
const PHNNOTVERIFICATION = '手机号码未验证，请先进行验证。'; //"Mobile Number not Verified, Please Perform Verification Before Proceed";
const PHONENUMBERISREQUIRED = '请输入手机号码'; //"Mobile Number is Required";
const ACTIONFREQEXCEEDTODAY = '请求验证码,已达到最大尝试次数，请明天再试'; //"Maximum Number of Attempts to Request OTP have been reached, Please Try Again Tomorrow";
const ACTIONFREQEXCEED = '不符合每个验证码请求之间的间隔时间，请稍后重试'; //"Minimum Interval Period between Each OTP Request is not met, Please Try Again Later";
const INVALIDUSERNAMEEXIST = '用户名无效，用户名已被使用'; //"Invalid Username, Username in use";
const INSUFFICIENTPOINTBAL = '积分余额不足，无法领取优惠卷'; //"Insufficient Point Balance to Claim the Deal";
const DATERANGEISREQUIRED = "请选择开始日期和结束日期";//"Date Range is Required";
const INVALIDMONTH = "无效的月份"//"Invalid Month";
const INVALIDYEAR = "无效的年份"//"Invalid Year";
const INVALIDORDERSTATUS = "单号状态异常"//"Invalid Order Status to Perform The Action";
const MEMBERNOTFOUND = "会员不存在"//"Member Not Found";
const INVALIDMEMBERSTATUS = "会员帐号异常，无法完成该行为"//"Invalid Member Status to Perform The Action";
const INVALIDVOUCHER = "无效的优惠卷"//"Invalid Voucher";
const VOUCHERPREVCLAIMED = "无法重复领取该优惠卷"//"Voucher can't be repeatedly claim";
const INCORRECTUSERPASS = "账号/密码错误"//"Invalid Username or Password";
const CONDITIONNOTMET = "未达成领取该优惠卷的前提条件"//"Unable to Redeem Voucher, Condition not met";
const INVALIDVOUCHERSTATUS = "该优惠卷无法使用"//"Invalid Voucher Status to Perform the Action";
const VOUCHERLIMITREACHED = "该优惠卷领取次数已满， 请稍后再试"//"Voucher Claim Limit Hit, Please Try Again Later";
const PREVIOUSREQUESTPENDING = "撤销账号失败，撤销请求不能重复提交"//"Fail to Request Remove Data, Previously Submitted Request is Pending";
const REFERRALNOTFOUND = "推荐码不正确";//Referral Number not found;

module.exports = {
    USERNAMEISREQUIRED: USERNAMEISREQUIRED,
    PASSWORDISREQUIRED: PASSWORDISREQUIRED,
    INVALIDKEY: INVALIDKEY,
    USERALREADYEXIST: USERALREADYEXIST,
    LOGINFAILED: LOGINFAILED,
    INCORRECTPASS: INCORRECTPASS,
    USERNOTFOUND: USERNOTFOUND,
    NAMEISREQUIRED: NAMEISREQUIRED,
    NORECORDFOUND: NORECORDFOUND,
    RECORDEXISTS: RECORDEXISTS,
    CURRENTPASSWORDISREQUIRED: CURRENTPASSWORDISREQUIRED,
    NEWPASSWORDISREQUIRED: NEWPASSWORDISREQUIRED,
    CONFIRMPASSWORDISREQUIRED: CONFIRMPASSWORDISREQUIRED,
    PASSWORDMISMATCH: PASSWORDMISMATCH,
    IDNPASSWORDSAME: IDNPASSWORDSAME,
    EMAILISREQUIRED: EMAILISREQUIRED,
    UNAUTHORIZED: UNAUTHORIZED,
    APINOTFOUND: APINOTFOUND,
    UNEXPECTEDERROR: UNEXPECTEDERROR,
    FIELDISREQUIRED: FIELDISREQUIRED,
    INVALIDVALUELENGTH: INVALIDVALUELENGTH,
    MAXDOCUMENTUPLOAD: MAXDOCUMENTUPLOAD,
    INVALIDFILELENGTH: INVALIDFILELENGTH,
    INVALIDFILETYPE: INVALIDFILETYPE,
    DOCUMENTNOTFOUND: DOCUMENTNOTFOUND,
    FUTUREDATE: FUTUREDATE,
    PASTDATE: PASTDATE,
    MISSINGDOCUMENT: MISSINGDOCUMENT,
    DOCUMENTISREQUIRED: DOCUMENTISREQUIRED,
    INVALIDDATAVALUE: INVALIDDATAVALUE,
    INVALIDAUTHORITY: INVALIDAUTHORITY,
    INVALIDSTATUS: INVALIDSTATUS,
    INVALIDRECEIVER: INVALIDRECEIVER,
    INVALIDCCRECEIVER: INVALIDCCRECEIVER,
    RECORDIDISREQUIRED: RECORDIDISREQUIRED,
    MULTIPLELOGIN: MULTIPLELOGIN,
    INVALIDPASSWORD: INVALIDPASSWORD,
    PASSWORDCANNOTSAME: PASSWORDCANNOTSAME,
    PASSWORDMNOTMATCH: PASSWORDMNOTMATCH,
    MEMBEREXPIRED: MEMBEREXPIRED,
    RESETUSED: RESETUSED,
    INVALIDRESETUID: INVALIDRESETUID,
    UPDATEFAILED: UPDATEFAILED,
    ACCOUNTCLOSED: ACCOUNTCLOSED,
    ACCOUNTLOCKED: ACCOUNTLOCKED,
    RESETDENIED: RESETDENIED,
    INVALIDVALUELENGTHMIN: INVALIDVALUELENGTHMIN,
    REPORTTYPEISREQUIRED: REPORTTYPEISREQUIRED,
    INVALIDDATERANGE: INVALIDDATERANGE,
    INVALIDOTP: INVALIDOTP,
    PHNNOTVERIFICATION: PHNNOTVERIFICATION,
    PHONENUMBERISREQUIRED: PHONENUMBERISREQUIRED,
    ACTIONFREQEXCEEDTODAY: ACTIONFREQEXCEEDTODAY,
    ACTIONFREQEXCEED: ACTIONFREQEXCEED,
    INVALIDUSERNAMEEXIST: INVALIDUSERNAMEEXIST,
    INSUFFICIENTPOINTBAL: INSUFFICIENTPOINTBAL,
    DATERANGEISREQUIRED: DATERANGEISREQUIRED,
    INVALIDMONTH: INVALIDMONTH,
    INVALIDYEAR: INVALIDYEAR,
    INVALIDORDERSTATUS: INVALIDORDERSTATUS,
    MEMBERNOTFOUND: MEMBERNOTFOUND,
    INVALIDMEMBERSTATUS: INVALIDMEMBERSTATUS,
    INVALIDVOUCHER: INVALIDVOUCHER,
    VOUCHERPREVCLAIMED: VOUCHERPREVCLAIMED,
    INCORRECTUSERPASS: INCORRECTUSERPASS,
    CONDITIONNOTMET: CONDITIONNOTMET,
    INVALIDVOUCHERSTATUS: INVALIDVOUCHERSTATUS,
    VOUCHERLIMITREACHED: VOUCHERLIMITREACHED,
    PREVIOUSREQUESTPENDING: PREVIOUSREQUESTPENDING,
    REFERRALNOTFOUND: REFERRALNOTFOUND
}
