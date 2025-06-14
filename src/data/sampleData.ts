
import { BloomReport } from '../types/BloomReport';

export const sampleBloomReports: BloomReport[] = [
  {
    id: '1',
    location_id: '1',
    user_id: '1',
    facebook_post_url: 'https://facebook.com/sarahbloom/posts/123',
    facebook_post_id: '123456_789012',
    title: 'פריחה מדהימה בגן סאקר!',
    description: 'הולכת בגן סאקר הבוקר וראיתי פריחה כל כך יפה של שקדיות ואמיגדלוס. הצבעים פשוט מרהיבים!',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop'
    ],
    flower_types: ['שקדיות', 'אמיגדלוס', 'פרחי אביב'],
    likes_count: 45,
    post_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: {
      id: '1',
      name: 'גן סאקר, ירושלים',
      description: 'פארק מרכזי בירושלים עם פריחה עשירה',
      latitude: 31.7683,
      longitude: 35.2137,
      intensity: 0.8
    },
    user: {
      id: '1',
      facebook_id: '123456789',
      facebook_username: 'sarahbloom',
      display_name: 'שרה כהן',
      profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: '2',
    location_id: '2',
    user_id: '2',
    facebook_post_url: 'https://facebook.com/danflowers/posts/456',
    facebook_post_id: '456789_012345',
    title: 'רוקדים עם הפרחים בהירקון',
    description: 'יום מושלם לטיול בפארק הירקון. הכלניות והדודאים פרחו במלוא הדרם!',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
    ],
    flower_types: ['כלניות', 'דודאים', 'פרחי שדה'],
    likes_count: 32,
    post_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: {
      id: '2',
      name: 'פארק הירקון, תל אביב',
      description: 'פארק גדול לאורך נהר הירקון',
      latitude: 32.1133,
      longitude: 34.8072,
      intensity: 0.6
    },
    user: {
      id: '2',
      facebook_id: '987654321',
      facebook_username: 'danflowers',
      display_name: 'דן לוי',
      profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: '3',
    location_id: '3',
    user_id: '3',
    facebook_post_url: 'https://facebook.com/mayabloom/posts/789',
    facebook_post_id: '789012_345678',
    title: 'כרמל בפריחה מלאה!',
    description: 'הטיול בכרמל היום היה פשוט קסום. הרקפות והסחלבים פרחו והכל צבוע באדום ובסגול',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    flower_types: ['רקפות', 'סחלבים', 'פרחי יער'],
    likes_count: 67,
    post_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: {
      id: '3',
      name: 'גן לאומי כרמל, חיפה',
      description: 'יער כרמל עם מגוון פרחי בר',
      latitude: 32.7357,
      longitude: 35.0818,
      intensity: 0.9
    },
    user: {
      id: '3',
      facebook_id: '456789123',
      facebook_username: 'mayabloom',
      display_name: 'מיה אברהם',
      profile_photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: '4',
    location_id: '5',
    user_id: '4',
    facebook_post_url: 'https://facebook.com/tomernature/posts/101',
    facebook_post_id: '101112_131415',
    title: 'גולן פורח במלוא הדרו!',
    description: 'נסיעה ברמת הגולן חשפה נופים מדהימים של פריחת בר. הקפים פרחו בכל הצבעים',
    images: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop'
    ],
    flower_types: ['פרחי בר', 'קפים', 'צבעונים'],
    likes_count: 28,
    post_date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: {
      id: '5',
      name: 'רמת הגולן',
      description: 'מרחבי הגולן עם פריחת אביב מרהיבה',
      latitude: 33.1208,
      longitude: 35.7725,
      intensity: 0.7
    },
    user: {
      id: '4',
      facebook_id: '789123456',
      facebook_username: 'tomernature',
      display_name: 'תומר דוד',
      profile_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: '5',
    location_id: '6',
    user_id: '1',
    facebook_post_url: 'https://facebook.com/sarahbloom/posts/456',
    facebook_post_id: '456789_101112',
    title: 'עמק יזרעאל כולו אדום!',
    description: 'נסיעה בעמק יזרעאל הציגה שטיח אדום של כלניות שמשתרע עד האופק',
    images: [
      'https://images.unsplash.com/photo-1463288889890-a56b2853c40f?w=400&h=300&fit=crop'
    ],
    flower_types: ['כלניות', 'פרחי שדה'],
    likes_count: 51,
    post_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: {
      id: '6',
      name: 'עמק יזרעאל',
      description: 'עמק חקלאי עם פריחת פרחי בר',
      latitude: 32.6181,
      longitude: 35.3069,
      intensity: 0.5
    },
    user: {
      id: '1',
      facebook_id: '123456789',
      facebook_username: 'sarahbloom',
      display_name: 'שרה כהן',
      profile_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face'
    }
  }
];
