async function fetchChannels(channels){
	let messages = [];
	for (let i = 0; i < channels.length; i++){
		let msgs = await channels[i].messages.fetch();
        for (let msg of msgs.values()) {
            messages.push(msg);
        }
	}
	return messages;
}

async function deleteMessages(messages){
	for (let i = 0; i < messages.length; i++){
		await messages[i].delete();
	}
}

module.exports = {
	delete: (user, channels, callback) => {
		console.log(`Deleting messages from ${user.tag}`);
		let p = 0;
		let n = 0;
		let pass = () => {
			console.log(p === 0 ? 'Fetching' : 'Re-fetching');
			fetchChannels(channels).then(messages => {
				messages = messages.filter(m => m.author.id === user.id);
				if(messages.length === 0){
					if(n > 0)
						console.log(`Done : ${n} messages deleted from ${user.tag}`);
					else
						console.log(`No message found to delete from ${user.tag}`);
					if(callback)
						callback(n);
					return;
				}
				console.log(`Pass #${++p} : deleting ${messages.length} messages`);
				deleteMessages(messages).then(() => {
					n+= messages.length;
					pass();
				});
			});
		};
		pass();
	}
};
