$(function(){
	var params = {};
	console.log(112)
	$.ajax({
		method: "POST",
		url: 'test/user/userlist',
		data: params,
		success: function(result){
			console.log(result)
		},
		fail: function(){
			console.log('服务挂了')
		}
	})

})