// index.js

/**
 * 首页脚本
 * 实现故事展示、播放控制和倒计时功能
 */
Page({
  data: {
    isPlaying: false, // 是否正在播放故事
    currentStory: null, // 当前播放的故事
    playerProgress: "00:00 / 00:00", // 播放进度
    timerMinutes: 30, // 默认倒计时时间（分钟）
    timerSeconds: 0, // 默认倒计时秒数
    timerRunning: false, // 倒计时是否运行中
    timerInterval: null, // 倒计时定时器
    showTimerSettingModal: false, // 是否显示倒计时设置模态框
    timeOptions: [5, 10, 15, 30, 45, 60], // 时间选项（分钟）
    audioContext: null, // 音频播放器
    currentTime: '02:45',
    totalTime: '06:30',
    isPaused: false,  // 播放器状态
    showPlaylistModal: false  // 是否显示播放目录模态框
  },

  onLoad() {
    // 页面加载时执行的逻辑
    wx.setNavigationBarTitle({
      title: '童声故事屋'
    });
    // 初始化音频播放器
    this.initAudioContext();
  },

  onUnload() {
    // 页面卸载时清除定时器
    this.clearTimerInterval();
  },

  /**
   * 初始化音频播放器
   */
  initAudioContext() {
    const audioContext = wx.createInnerAudioContext();
    
    audioContext.onPlay(() => {
      console.log('音频开始播放');
      this.setData({
        isPlaying: true
      });
    });
    
    audioContext.onPause(() => {
      console.log('音频暂停');
      this.setData({
        isPlaying: false
      });
    });
    
    audioContext.onStop(() => {
      console.log('音频停止');
      this.setData({
        isPlaying: false
      });
    });
    
    audioContext.onTimeUpdate(() => {
      // 更新播放进度
      const currentTime = this.formatTime(audioContext.currentTime);
      const duration = this.formatTime(audioContext.duration);
      
      this.setData({
        playerProgress: `${currentTime} / ${duration}`
      });
    });
    
    audioContext.onEnded(() => {
      console.log('音频播放结束');
      // 播放结束后，可以自动播放下一个故事
      this.nextTrack();
    });
    
    this.audioContext = audioContext;
  },

  /**
   * 格式化时间为 mm:ss 格式
   */
  formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // 播放故事
  playStory(e) {
    const title = e.currentTarget.dataset.title;
    console.log('播放故事:', title);
    
    // 模拟故事数据
    const storyMap = {
      '白雪公主': {
        title: '白雪公主',
        duration: '08:00',
        source: 'https://example.com/stories/snow-white.mp3'
      },
      '三只小猪': {
        title: '三只小猪',
        duration: '06:30',
        source: 'https://example.com/stories/three-pigs.mp3'
      },
      '小红帽': {
        title: '小红帽',
        duration: '07:00',
        source: 'https://example.com/stories/red-riding-hood.mp3'
      },
      '灰姑娘': {
        title: '灰姑娘',
        duration: '09:00',
        source: 'https://example.com/stories/cinderella.mp3'
      }
    };
    
    const story = storyMap[title];
    
    if (story) {
      // 设置音频源
      this.audioContext.src = story.source;
      
      // 更新当前故事
      this.setData({
        currentStory: story,
        isPlaying: true
      });
      
      // 播放音频
      this.audioContext.play();
      
      // 提示：实际应用中应使用真实的音频文件
      wx.showToast({
        title: `正在播放：${title}`,
        icon: 'none'
      });
    }
  },

  // 播放推荐故事
  playRecommendation() {
    // 模拟推荐故事数据
    const recommendedStory = {
      title: '龙的传说',
      duration: '10:00',
      source: 'https://example.com/stories/dragon-legend.mp3'
    };
    
    // 设置音频源
    this.audioContext.src = recommendedStory.source;
    
    // 更新当前故事
    this.setData({
      currentStory: recommendedStory,
      isPlaying: true
    });
    
    // 播放音频
    this.audioContext.play();
    
    wx.showToast({
      title: `正在播放：${recommendedStory.title}`,
      icon: 'none'
    });
  },

  // 播放摇篮曲
  playLullaby(e) {
    const type = e.currentTarget.dataset.type;
    
    // 摇篮曲数据映射
    const lullabyMap = {
      'world': {
        title: '世界名曲 - 摇篮曲',
        duration: '05:30',
        source: 'https://example.com/lullaby/world.mp3'
      },
      'chinese': {
        title: '中国童谣 - 摇篮曲',
        duration: '04:45',
        source: 'https://example.com/lullaby/chinese.mp3'
      }
    };
    
    const lullaby = lullabyMap[type];
    
    if (lullaby) {
      // 设置音频源
      this.audioContext.src = lullaby.source;
      
      // 更新当前故事
      this.setData({
        currentStory: lullaby,
        isPlaying: true
      });
      
      // 播放音频
      this.audioContext.play();
      
      wx.showToast({
        title: `正在播放：${lullaby.title}`,
        icon: 'none'
      });
    }
  },

  // 切换播放状态
  togglePlay() {
    if (this.audioContext.paused) {
      this.audioContext.play();
      this.setData({
        isPlaying: true
      });
    } else {
      this.audioContext.pause();
      this.setData({
        isPlaying: false
      });
    }
  },

  // 上一曲
  prevTrack() {
    wx.showToast({
      title: '切换到上一个故事',
      icon: 'none'
    });
  },

  // 下一曲
  nextTrack() {
    wx.showToast({
      title: '切换到下一个故事',
      icon: 'none'
    });
  },

  // 睡眠倒计时 - 开始
  startTimer() {
    // 如果计时器已经运行，则不重复启动
    if (this.data.timerRunning) {
      return;
    }
    
    // 将时间转换为总秒数
    let totalSeconds = this.data.timerMinutes * 60 + this.data.timerSeconds;
    
    if (totalSeconds <= 0) {
      wx.showToast({
        title: '请先设置倒计时时间',
        icon: 'none'
      });
      return;
    }
    
    // 设置计时器状态为运行中
    this.setData({
      timerRunning: true
    });
    
    wx.showToast({
      title: '倒计时已开始',
      icon: 'success'
    });
    
    // 创建计时器，每秒更新一次
    const timerInterval = setInterval(() => {
      totalSeconds--;
      
      // 计算分钟和秒数
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      // 更新显示的时间
      this.setData({
        timerMinutes: minutes,
        timerSeconds: seconds
      });
      
      // 检查计时器是否结束
      if (totalSeconds <= 0) {
        this.endTimer();
      }
    }, 1000);
    
    // 保存计时器ID
    this.setData({
      timerInterval
    });
  },

  // 睡眠倒计时 - 设置
  setTimer() {
    this.setData({
      showTimerSettingModal: true
    });
  },

  // 关闭设置倒计时模态框
  closeTimerSettingModal() {
    this.setData({
      showTimerSettingModal: false
    });
  },

  // 选择倒计时时间
  selectTime(e) {
    const minutes = parseInt(e.currentTarget.dataset.time);
    
    this.setData({
      timerMinutes: minutes,
      timerSeconds: 0,
      showTimerSettingModal: false
    });
    
    wx.showToast({
      title: `已设置${minutes}分钟`,
      icon: 'success'
    });
  },

  // 自定义倒计时时间
  customTimeInput(e) {
    const minutes = parseInt(e.detail.value);
    
    if (!isNaN(minutes) && minutes > 0) {
      this.setData({
        timerMinutes: minutes,
        timerSeconds: 0,
        showTimerSettingModal: false
      });
      
      wx.showToast({
        title: `已设置${minutes}分钟`,
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '请输入有效的时间',
        icon: 'none'
      });
    }
  },

  // 结束倒计时
  endTimer() {
    // 清除计时器
    this.clearTimerInterval();
    
    // 更新计时器状态
    this.setData({
      timerRunning: false
    });
    
    // 倒计时结束后，停止音频播放
    if (this.audioContext && !this.audioContext.paused) {
      this.audioContext.pause();
      this.setData({
        isPlaying: false
      });
      
      wx.showToast({
        title: '倒计时结束，已停止播放',
        icon: 'none'
      });
    }
  },

  // 清除计时器
  clearTimerInterval() {
    if (this.data.timerInterval !== null) {
      clearInterval(this.data.timerInterval);
      this.setData({
        timerInterval: null
      });
    }
  },

  // 页面跳转 - 故事库
  navigateToStoryStore() {
    wx.showToast({
      title: '即将跳转到故事库',
      icon: 'none'
    });
    
    // 实际应用中应该使用wx.navigateTo跳转到对应页面
    // wx.navigateTo({
    //   url: '/pages/story_store/story_store'
    // });
  },

  // 页面跳转 - 个人中心
  navigateToProfile() {
    wx.showToast({
      title: '即将跳转到我的页面',
      icon: 'none'
    });
    
    // 实际应用中应该使用wx.navigateTo跳转到对应页面
    // wx.navigateTo({
    //   url: '/pages/profile/profile'
    // });
  },

  /**
   * 显示播放目录
   */
  showPlaylist() {
    this.setData({
      showPlaylistModal: true
    });
  },

  /**
   * 关闭播放目录模态框
   */
  closePlaylistModal() {
    this.setData({
      showPlaylistModal: false
    });
  },

  /**
   * 从播放列表中选择故事
   */
  selectPlaylistItem(e) {
    const title = e.currentTarget.dataset.title;
    this.playStory(e);
    this.closePlaylistModal();
  },

  /**
   * 从播放列表中移除故事
   */
  removeFromPlaylist(e) {
    const title = e.currentTarget.dataset.title;
    
    // 在实际应用中，这里应该从播放列表数据中移除对应的故事
    // 这里只做简单的提示
    wx.showToast({
      title: `已从播放列表移除：${title}`,
      icon: 'none'
    });
    
    // 阻止事件冒泡，避免触发选择事件
    return false;
  }
}) 