import User from "../models/user.model.js";

// viewer can see the posts if the account is public, it is the viewer's own account or the viewer follows the author
const canViewPosts = async (viewerId, authorId) => {
    if (authorId.toString() === viewerId) return true;

    const author = await User.findById(authorId).select('isPrivate followers');
    if (!author) return false;

    if (!author.isPrivate) return true;

    return author.followers.includes(viewerId);
}

export default canViewPosts;
