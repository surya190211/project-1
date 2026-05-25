import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';
import User from '../models/User.js';

dotenv.config();

const SQ = [
  {title:'Two Sum',topic:'Arrays',difficulty:'Easy',url:'https://leetcode.com/problems/two-sum/',tags:['hash-map','array'],num:1,slug:'two-sum',cc:'Two Sum'},
  {title:'Best Time to Buy and Sell Stock',topic:'Arrays',difficulty:'Easy',url:'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',tags:['greedy'],num:121,slug:'best-time-to-buy-and-sell-stock',cc:''},
  {title:'Contains Duplicate',topic:'Arrays',difficulty:'Easy',url:'https://leetcode.com/problems/contains-duplicate/',tags:['hash-set'],num:217,slug:'contains-duplicate',cc:''},
  {title:'Product of Array Except Self',topic:'Arrays',difficulty:'Medium',url:'https://leetcode.com/problems/product-of-array-except-self/',tags:['prefix-sum'],num:238,slug:'product-of-array-except-self',cc:''},
  {title:'Maximum Subarray',topic:'Arrays',difficulty:'Medium',url:'https://leetcode.com/problems/maximum-subarray/',tags:['kadane','dp'],num:53,slug:'maximum-subarray',cc:'Maximum Subarray Sum'},
  {title:'3Sum',topic:'Arrays',difficulty:'Medium',url:'https://leetcode.com/problems/3sum/',tags:['two-pointers','sorting'],num:15,slug:'3sum',cc:''},
  {title:'Trapping Rain Water',topic:'Arrays',difficulty:'Hard',url:'https://leetcode.com/problems/trapping-rain-water/',tags:['two-pointers','stack'],num:42,slug:'trapping-rain-water',cc:''},
  {title:'Median of Two Sorted Arrays',topic:'Arrays',difficulty:'Hard',url:'https://leetcode.com/problems/median-of-two-sorted-arrays/',tags:['binary-search'],num:4,slug:'median-of-two-sorted-arrays',cc:''},
  {title:'Valid Anagram',topic:'Strings',difficulty:'Easy',url:'https://leetcode.com/problems/valid-anagram/',tags:['hash-map'],num:242,slug:'valid-anagram',cc:''},
  {title:'Valid Palindrome',topic:'Strings',difficulty:'Easy',url:'https://leetcode.com/problems/valid-palindrome/',tags:['two-pointers'],num:125,slug:'valid-palindrome',cc:'Palindrome String'},
  {title:'Longest Substring Without Repeating Characters',topic:'Strings',difficulty:'Medium',url:'https://leetcode.com/problems/longest-substring-without-repeating-characters/',tags:['sliding-window','hash-map'],num:3,slug:'longest-substring-without-repeating-characters',cc:'Longest Unique Substring'},
  {title:'Group Anagrams',topic:'Strings',difficulty:'Medium',url:'https://leetcode.com/problems/group-anagrams/',tags:['hash-map','sorting'],num:49,slug:'group-anagrams',cc:''},
  {title:'Minimum Window Substring',topic:'Strings',difficulty:'Hard',url:'https://leetcode.com/problems/minimum-window-substring/',tags:['sliding-window','hash-map'],num:76,slug:'minimum-window-substring',cc:''},
  {title:'Reverse a Linked List',topic:'Linked Lists',difficulty:'Easy',url:'https://leetcode.com/problems/reverse-linked-list/',tags:['linked-list'],num:206,slug:'reverse-linked-list',cc:'Reverse Linked List'},
  {title:'Merge Two Sorted Lists',topic:'Linked Lists',difficulty:'Easy',url:'https://leetcode.com/problems/merge-two-sorted-lists/',tags:['linked-list'],num:21,slug:'merge-two-sorted-lists',cc:''},
  {title:'Linked List Cycle',topic:'Linked Lists',difficulty:'Easy',url:'https://leetcode.com/problems/linked-list-cycle/',tags:['fast-slow-pointers'],num:141,slug:'linked-list-cycle',cc:'Detect Loop in Linked List'},
  {title:'Remove Nth Node From End of List',topic:'Linked Lists',difficulty:'Medium',url:'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',tags:['two-pointers'],num:19,slug:'remove-nth-node-from-end-of-list',cc:''},
  {title:'Reorder List',topic:'Linked Lists',difficulty:'Medium',url:'https://leetcode.com/problems/reorder-list/',tags:['fast-slow-pointers'],num:143,slug:'reorder-list',cc:''},
  {title:'Merge K Sorted Lists',topic:'Linked Lists',difficulty:'Hard',url:'https://leetcode.com/problems/merge-k-sorted-lists/',tags:['heap'],num:23,slug:'merge-k-sorted-lists',cc:''},
  {title:'Valid Parentheses',topic:'Stacks & Queues',difficulty:'Easy',url:'https://leetcode.com/problems/valid-parentheses/',tags:['stack'],num:20,slug:'valid-parentheses',cc:'Valid Parentheses'},
  {title:'Min Stack',topic:'Stacks & Queues',difficulty:'Medium',url:'https://leetcode.com/problems/min-stack/',tags:['stack'],num:155,slug:'min-stack',cc:''},
  {title:'Daily Temperatures',topic:'Stacks & Queues',difficulty:'Medium',url:'https://leetcode.com/problems/daily-temperatures/',tags:['monotonic-stack'],num:739,slug:'daily-temperatures',cc:''},
  {title:'Largest Rectangle in Histogram',topic:'Stacks & Queues',difficulty:'Hard',url:'https://leetcode.com/problems/largest-rectangle-in-histogram/',tags:['monotonic-stack'],num:84,slug:'largest-rectangle-in-histogram',cc:'Largest Rectangle in Histogram'},
  {title:'Invert Binary Tree',topic:'Trees',difficulty:'Easy',url:'https://leetcode.com/problems/invert-binary-tree/',tags:['dfs'],num:226,slug:'invert-binary-tree',cc:''},
  {title:'Maximum Depth of Binary Tree',topic:'Trees',difficulty:'Easy',url:'https://leetcode.com/problems/maximum-depth-of-binary-tree/',tags:['dfs','bfs'],num:104,slug:'maximum-depth-of-binary-tree',cc:'Height of Binary Tree'},
  {title:'Balanced Binary Tree',topic:'Trees',difficulty:'Easy',url:'https://leetcode.com/problems/balanced-binary-tree/',tags:['dfs'],num:110,slug:'balanced-binary-tree',cc:''},
  {title:'Binary Tree Level Order Traversal',topic:'Trees',difficulty:'Medium',url:'https://leetcode.com/problems/binary-tree-level-order-traversal/',tags:['bfs'],num:102,slug:'binary-tree-level-order-traversal',cc:'Level Order Traversal'},
  {title:'Validate Binary Search Tree',topic:'Trees',difficulty:'Medium',url:'https://leetcode.com/problems/validate-binary-search-tree/',tags:['dfs','bst'],num:98,slug:'validate-binary-search-tree',cc:''},
  {title:'Lowest Common Ancestor of BST',topic:'Trees',difficulty:'Medium',url:'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',tags:['bst'],num:235,slug:'lowest-common-ancestor-of-a-binary-search-tree',cc:'LCA in BST'},
  {title:'Binary Tree Maximum Path Sum',topic:'Trees',difficulty:'Hard',url:'https://leetcode.com/problems/binary-tree-maximum-path-sum/',tags:['dfs','dp'],num:124,slug:'binary-tree-maximum-path-sum',cc:''},
  {title:'Serialize and Deserialize Binary Tree',topic:'Trees',difficulty:'Hard',url:'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',tags:['dfs'],num:297,slug:'serialize-and-deserialize-binary-tree',cc:''},
  {title:'Number of Islands',topic:'Graphs',difficulty:'Medium',url:'https://leetcode.com/problems/number-of-islands/',tags:['dfs','bfs'],num:200,slug:'number-of-islands',cc:'Number of Islands'},
  {title:'Clone Graph',topic:'Graphs',difficulty:'Medium',url:'https://leetcode.com/problems/clone-graph/',tags:['dfs','bfs'],num:133,slug:'clone-graph',cc:''},
  {title:'Course Schedule',topic:'Graphs',difficulty:'Medium',url:'https://leetcode.com/problems/course-schedule/',tags:['topological-sort'],num:207,slug:'course-schedule',cc:''},
  {title:'Pacific Atlantic Water Flow',topic:'Graphs',difficulty:'Medium',url:'https://leetcode.com/problems/pacific-atlantic-water-flow/',tags:['dfs','bfs'],num:417,slug:'pacific-atlantic-water-flow',cc:''},
  {title:'Word Ladder',topic:'Graphs',difficulty:'Hard',url:'https://leetcode.com/problems/word-ladder/',tags:['bfs'],num:127,slug:'word-ladder',cc:''},
  {title:'Climbing Stairs',topic:'Dynamic Programming',difficulty:'Easy',url:'https://leetcode.com/problems/climbing-stairs/',tags:['dp','fibonacci'],num:70,slug:'climbing-stairs',cc:'Climb Stairs'},
  {title:'House Robber',topic:'Dynamic Programming',difficulty:'Medium',url:'https://leetcode.com/problems/house-robber/',tags:['dp'],num:198,slug:'house-robber',cc:''},
  {title:'Coin Change',topic:'Dynamic Programming',difficulty:'Medium',url:'https://leetcode.com/problems/coin-change/',tags:['dp','knapsack'],num:322,slug:'coin-change',cc:'Coin Change'},
  {title:'Longest Common Subsequence',topic:'Dynamic Programming',difficulty:'Medium',url:'https://leetcode.com/problems/longest-common-subsequence/',tags:['dp','2d-dp'],num:1143,slug:'longest-common-subsequence',cc:'LCS'},
  {title:'Word Break',topic:'Dynamic Programming',difficulty:'Medium',url:'https://leetcode.com/problems/word-break/',tags:['dp','memoization'],num:139,slug:'word-break',cc:''},
  {title:'Edit Distance',topic:'Dynamic Programming',difficulty:'Hard',url:'https://leetcode.com/problems/edit-distance/',tags:['dp','2d-dp'],num:72,slug:'edit-distance',cc:'Edit Distance'},
  {title:'Burst Balloons',topic:'Dynamic Programming',difficulty:'Hard',url:'https://leetcode.com/problems/burst-balloons/',tags:['dp','interval-dp'],num:312,slug:'burst-balloons',cc:''},
  {title:'Binary Search',topic:'Binary Search',difficulty:'Easy',url:'https://leetcode.com/problems/binary-search/',tags:['binary-search'],num:704,slug:'binary-search',cc:'Binary Search'},
  {title:'Find Minimum in Rotated Sorted Array',topic:'Binary Search',difficulty:'Medium',url:'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',tags:['binary-search'],num:153,slug:'find-minimum-in-rotated-sorted-array',cc:''},
  {title:'Search in Rotated Sorted Array',topic:'Binary Search',difficulty:'Medium',url:'https://leetcode.com/problems/search-in-rotated-sorted-array/',tags:['binary-search'],num:33,slug:'search-in-rotated-sorted-array',cc:''},
  {title:'Koko Eating Bananas',topic:'Binary Search',difficulty:'Medium',url:'https://leetcode.com/problems/koko-eating-bananas/',tags:['binary-search','greedy'],num:875,slug:'koko-eating-bananas',cc:''},
  {title:'Valid Palindrome II',topic:'Two Pointers',difficulty:'Easy',url:'https://leetcode.com/problems/valid-palindrome-ii/',tags:['two-pointers'],num:680,slug:'valid-palindrome-ii',cc:''},
  {title:'Container With Most Water',topic:'Two Pointers',difficulty:'Medium',url:'https://leetcode.com/problems/container-with-most-water/',tags:['two-pointers','greedy'],num:11,slug:'container-with-most-water',cc:''},
  {title:'Sort Colors',topic:'Two Pointers',difficulty:'Medium',url:'https://leetcode.com/problems/sort-colors/',tags:['two-pointers'],num:75,slug:'sort-colors',cc:''},
  {title:'Maximum Average Subarray I',topic:'Sliding Window',difficulty:'Easy',url:'https://leetcode.com/problems/maximum-average-subarray-i/',tags:['sliding-window'],num:643,slug:'maximum-average-subarray-i',cc:''},
  {title:'Longest Repeating Character Replacement',topic:'Sliding Window',difficulty:'Medium',url:'https://leetcode.com/problems/longest-repeating-character-replacement/',tags:['sliding-window'],num:424,slug:'longest-repeating-character-replacement',cc:''},
  {title:'Sliding Window Maximum',topic:'Sliding Window',difficulty:'Hard',url:'https://leetcode.com/problems/sliding-window-maximum/',tags:['sliding-window','monotonic-deque'],num:239,slug:'sliding-window-maximum',cc:''},
  {title:'Kth Largest Element in a Stream',topic:'Heap / Priority Queue',difficulty:'Easy',url:'https://leetcode.com/problems/kth-largest-element-in-a-stream/',tags:['heap'],num:703,slug:'kth-largest-element-in-a-stream',cc:''},
  {title:'Top K Frequent Elements',topic:'Heap / Priority Queue',difficulty:'Medium',url:'https://leetcode.com/problems/top-k-frequent-elements/',tags:['heap','hash-map'],num:347,slug:'top-k-frequent-elements',cc:''},
  {title:'Find Median from Data Stream',topic:'Heap / Priority Queue',difficulty:'Hard',url:'https://leetcode.com/problems/find-median-from-data-stream/',tags:['heap','two-heaps'],num:295,slug:'find-median-from-data-stream',cc:''},
  {title:'Subsets',topic:'Recursion & Backtracking',difficulty:'Medium',url:'https://leetcode.com/problems/subsets/',tags:['backtracking'],num:78,slug:'subsets',cc:''},
  {title:'Combination Sum',topic:'Recursion & Backtracking',difficulty:'Medium',url:'https://leetcode.com/problems/combination-sum/',tags:['backtracking'],num:39,slug:'combination-sum',cc:''},
  {title:'Permutations',topic:'Recursion & Backtracking',difficulty:'Medium',url:'https://leetcode.com/problems/permutations/',tags:['backtracking'],num:46,slug:'permutations',cc:''},
  {title:'N-Queens',topic:'Recursion & Backtracking',difficulty:'Hard',url:'https://leetcode.com/problems/n-queens/',tags:['backtracking'],num:51,slug:'n-queens',cc:'N Queens'},
  {title:'Find the Duplicate Number',topic:'Arrays',difficulty:'Medium',url:'https://leetcode.com/problems/find-the-duplicate-number/',tags:['fast-slow-pointers','binary-search'],num:287,slug:'find-the-duplicate-number',cc:''},
  {title:'Longest Palindromic Substring',topic:'Strings',difficulty:'Medium',url:'https://leetcode.com/problems/longest-palindromic-substring/',tags:['dp','expand-around-center'],num:5,slug:'longest-palindromic-substring',cc:'Longest Palindrome'}
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Questions
    const count = await Question.countDocuments();
    if (count === 0) {
      await Question.insertMany(SQ);
      console.log(`Successfully seeded ${SQ.length} questions.`);
    } else {
      console.log(`Questions collection already contains ${count} documents. Skipping question seed.`);
    }

    // 2. Seed Default User if none exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultUser = new User({
        username: 'demo_coder',
        email: 'demo@dsa.com',
        notif: true,
        streak: { cur: 0, best: 0, last: null }
      });
      await defaultUser.save();
      console.log('Successfully seeded default user (demo_coder / demo@dsa.com).');
    } else {
      console.log(`Users collection already contains ${userCount} users. Skipping user seed.`);
    }

    mongoose.connection.close();
    console.log('Database seeding process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
