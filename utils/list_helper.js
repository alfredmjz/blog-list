const dummy = (blogs) => {
	const ret = blogs.length - blogs.length + 1;
	return ret;
};

const totalLikes = (blogs) => {
	const likes = blogs.reduce((total, blog) => {
		return total + blog.likes;
	}, 0);
	return likes > 0 ? likes : 0;
};

module.exports = {
	dummy,
	totalLikes,
};
