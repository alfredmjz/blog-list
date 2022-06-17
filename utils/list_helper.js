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

const favoriteBlog = (blogs) => {
	blogs.map((blog) => {
		return (blog = {
			title: blog.title,
			author: blog.author,
			likes: blog.likes,
		});
	});

	const currentFav = blogs.reduce((previousBlog, currentBlog) => {
		return previousBlog.likes > currentBlog.likes ? previousBlog : currentBlog;
	}, blogs[0]);
	return currentFav ? currentFav : {};
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
};
