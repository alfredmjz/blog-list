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
	blogs = blogs.map((blog) => {
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

//Need to optimize
const mostBlogs = (blogs) => {
	const hashMap = [];
	let formatResult = {
		author: "",
		blogs: -1,
	};

	blogs.forEach((blog) => {
		let idx = -1;
		const exist = hashMap.find((myList, index) => {
			idx = index;
			return blog.author === myList.author;
		});
		if (!exist || hashMap.length === 0) {
			hashMap.push({
				author: blog.author,
				blogs: 0,
			});
			idx = hashMap.length - 1;
		}
		hashMap[idx].blogs += 1;
		if (hashMap[idx].blogs > formatResult.blogs) {
			formatResult.author = hashMap[idx].author;
			formatResult.blogs = hashMap[idx].blogs;
		}
	});
	return formatResult.author === "" ? {} : formatResult;
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
};
