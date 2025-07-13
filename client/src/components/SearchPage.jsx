"use client"
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, X, Users } from 'lucide-react';
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers';

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { suggestedUsers } = useSelector(store => store.auth);
    
    // Load suggested users on component mount
    useGetSuggestedUsers();

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) {
            return suggestedUsers || [];
        }

        const query = searchQuery.toLowerCase().trim();
        return (suggestedUsers || []).filter(user => 
            user.username?.toLowerCase().includes(query) ||
            user.bio?.toLowerCase().includes(query) ||
            user.fullName?.toLowerCase().includes(query)
        );
    }, [searchQuery, suggestedUsers]);

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const UserCard = ({ user, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <Link to={`/profile/${user._id}`}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Avatar className="w-14 h-14 ring-2 ring-gray-100 shadow-sm">
                            <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt="profile" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg">
                                {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </motion.div>
                </Link>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        <Link to={`/profile/${user._id}`} className="hover:text-gray-700 transition-colors">
                            {user.username}
                        </Link>
                    </h3>
                    <p className="text-gray-500 text-sm truncate mb-1">
                        {user.bio || "No bio available"}
                    </p>
                    {user.followers && (
                        <span className="text-xs text-gray-400">
                            {user.followers.length} followers
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-4 py-6"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h1>
                <p className="text-gray-600">Find and connect with amazing people</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users by name, username, or bio..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {searchQuery && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleClearSearch}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {!searchQuery ? (
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <Users className="w-5 h-5 text-gray-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Suggested Users ({suggestedUsers?.length || 0})
                            </h2>
                        </motion.div>
                        
                        {suggestedUsers?.length > 0 ? (
                            <div className="space-y-4">
                                {suggestedUsers.map((user, index) => (
                                    <UserCard key={user._id} user={user} index={index} />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200"
                            >
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No suggested users available</p>
                                <p className="text-gray-500 text-sm mt-1">Check back later for recommendations</p>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <Search className="w-5 h-5 text-gray-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Search Results ({filteredUsers.length})
                            </h2>
                        </motion.div>
                        
                        {filteredUsers.length > 0 ? (
                            <div className="space-y-4">
                                {filteredUsers.map((user, index) => (
                                    <UserCard key={user._id} user={user} index={index} />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200"
                            >
                                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No users found for "{searchQuery}"</p>
                                <p className="text-gray-500 text-sm mt-1">Try searching with different keywords</p>
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
            >
                <p className="text-xs text-gray-400">© 2024 Social App. All rights reserved.</p>
            </motion.div>
        </motion.div>
    );
};

export default React.memo(SearchPage);