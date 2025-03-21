/**
 * 故事库页面脚本
 * 实现故事列表展示、故事搜索、分类筛选和上传功能
 */
Page({
  data: {
    // 分类相关
    currentCategory: 'all', // 当前选中的分类
    
    // 故事列表
    storyList: [], // 故事列表
    hasMoreStories: true, // 是否有更多故事
    
    // 上传相关
    showUploadOptions: false, // 是否显示上传选项
    showUploadOptionsClass: '', // 上传选项弹窗动画类
    showTextUploadModal: false, // 是否显示文本上传模态框
    showAudioUploadModal: false, // 是否显示录音上传模态框
    showAIUploadModal: false, // 是否显示AI音色上传模态框
    
    // 录音相关
    isRecording: false, // 是否正在录音
    recordStatusText: '点击开始录制您的故事', // 录音状态文本
    recordingComplete: false, // 录音是否完成
    recordingDuration: 0, // 录音时长（秒）
    recordTimer: null, // 录音计时器
    
    // 新故事数据
    newStory: {
      title: '',
      category: '',
      description: '',
      content: '',
      language: 'zh', // 默认中文
      voiceType: 'system', // 默认系统音色
      voice: '',
      isPrivate: true
    },
    
    // 封面临时URL
    tempCoverUrl: '',
    
    // 故事类别选项
    categoryOptions: ['经典童话', '动物故事', '睡前故事', '科普故事', '冒险故事'],
    categoryIndex: 0,
    
    // 语音相关
    systemVoices: ['成年女声', '成年男声', '儿童声', '温柔女声', '浑厚男声'],
    systemVoiceIndex: 0,
    
    myVoices: [], // 用户自定义音色
    customVoiceIndex: 0,
    
    // 筛选相关
    showFilterModal: false, // 是否显示筛选模态框
    filter: {
      ageRange: 'all', // 年龄段筛选
      duration: 'all', // 时长筛选
      sort: 'popular' // 排序方式
    }
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '故事库'
    });
    
    // 初始化录音管理器
    this.initRecorderManager();
    
    // 获取故事列表
    this.getStoryList();
  },

  /**
   * 初始化录音管理器
   */
  initRecorderManager() {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({
        isRecording: true,
        recordStatusText: '正在录制中...',
        recordingComplete: false,
        recordingDuration: 0
      });
      
      // 开始计时
      this.startRecordTimer();
    });
    
    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      const { tempFilePath } = res;
      
      // 清除计时器
      this.clearRecordTimer();
      
      this.setData({
        isRecording: false,
        recordStatusText: '录制完成，点击保存',
        recordingComplete: true,
        tempVoiceFilePath: tempFilePath
      });
      
      // 播放录音示例
      wx.showToast({
        title: '录制完成',
        icon: 'success'
      });
    });
    
    recorderManager.onError((res) => {
      console.error('录音错误:', res);
      
      // 清除计时器
      this.clearRecordTimer();
      
      wx.showToast({
        title: '录音失败，请重试',
        icon: 'none'
      });
      
      this.setData({
        isRecording: false,
        recordStatusText: '录制失败，请重试',
        recordingComplete: false
      });
    });
    
    this.recorderManager = recorderManager;
  },

  /**
   * 开始录音计时器
   */
  startRecordTimer() {
    // 清除可能存在的计时器
    this.clearRecordTimer();
    
    // 创建新计时器
    const recordTimer = setInterval(() => {
      this.setData({
        recordingDuration: this.data.recordingDuration + 1
      });
      
      // 如果录音时间超过3分钟，自动停止
      if (this.data.recordingDuration >= 180) {
        this.stopRecording();
        wx.showToast({
          title: '录音已达到最大时长',
          icon: 'none'
        });
      }
    }, 1000);
    
    this.setData({ recordTimer });
  },

  /**
   * 清除录音计时器
   */
  clearRecordTimer() {
    if (this.data.recordTimer) {
      clearInterval(this.data.recordTimer);
      this.setData({ recordTimer: null });
    }
  },

  /**
   * 获取故事列表
   * 根据当前分类和筛选条件获取故事列表
   */
  getStoryList() {
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 模拟API请求延迟
    setTimeout(() => {
      // 模拟故事数据
      const mockStories = [
        {
          id: 1,
          title: '白雪公主',
          description: '白雪公主遇到七个小矮人的经典童话故事',
          cover: 'https://images.unsplash.com/photo-1583160247711-2191776b4b91?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhaXJ5JTIwdGFsZXxlbnwwfHwwfHx8MA%3D%3D',
          category: '经典童话',
          duration: '8分钟',
          plays: 1256,
          isNew: true
        },
        {
          id: 2,
          title: '三只小猪',
          description: '三只小猪与大灰狼的智慧较量',
          cover: 'https://images.unsplash.com/photo-1597322554556-6a7080400520?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBpZ3xlbnwwfHwwfHx8MA%3D%3D',
          category: '经典童话',
          duration: '6分钟',
          plays: 958
        },
        {
          id: 3,
          title: '小红帽',
          description: '小红帽在森林中遇到大灰狼的冒险',
          cover: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvbGZ8ZW58MHx8MHx8fDA%3D',
          category: '经典童话',
          duration: '7分钟',
          plays: 1045
        },
        {
          id: 4,
          title: '灰姑娘',
          description: '灰姑娘参加王子舞会的美丽童话',
          cover: 'https://images.unsplash.com/photo-1578898887932-7be3a5ad8efd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2luZGVyZWxsYXxlbnwwfHwwfHx8MA%3D%3D',
          category: '经典童话',
          duration: '9分钟',
          plays: 1358
        },
        {
          id: 5,
          title: '森林动物历险记',
          description: '兔子和松鼠在森林中的奇妙冒险',
          cover: 'https://images.unsplash.com/photo-1547015688-29913093c99c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFiYml0JTIwaW4lMjBmb3Jlc3R8ZW58MHx8MHx8fDA%3D',
          category: '动物故事',
          duration: '5分钟',
          plays: 847,
          isCustom: true
        }
      ];
      
      // 根据分类筛选
      let filteredStories = mockStories;
      
      if (this.data.currentCategory !== 'all') {
        const categoryMap = {
          'recommend': story => story.isNew,
          'classic': story => story.category === '经典童话',
          'animal': story => story.category === '动物故事',
          'sleep': story => story.category === '睡前故事',
          'education': story => story.category === '科普故事',
          'custom': story => story.isCustom
        };
        
        if (categoryMap[this.data.currentCategory]) {
          filteredStories = mockStories.filter(categoryMap[this.data.currentCategory]);
        }
      }
      
      // 应用筛选条件
      if (this.data.filter.ageRange !== 'all' || this.data.filter.duration !== 'all') {
        // 实际应用中这里应根据筛选条件进一步过滤
      }
      
      // 应用排序
      const sortMap = {
        'popular': (a, b) => b.plays - a.plays,
        'newest': (a, b) => b.id - a.id,
        'duration': (a, b) => {
          const timeA = parseInt(a.duration);
          const timeB = parseInt(b.duration);
          return timeA - timeB;
        }
      };
      
      filteredStories.sort(sortMap[this.data.filter.sort] || sortMap.popular);
      
      // 更新数据
      this.setData({
        storyList: filteredStories,
        hasMoreStories: false // 示例中没有更多故事了
      });
      
      // 隐藏加载提示
      wx.hideLoading();
    }, 1000);
  },

  /**
   * 加载更多故事
   */
  loadMoreStories() {
    // 实际应用中应该分页加载更多故事
    wx.showToast({
      title: '没有更多故事了',
      icon: 'none'
    });
  },

  /**
   * 搜索故事
   */
  searchStory(e) {
    const keyword = e.detail.value;
    console.log('搜索关键词:', keyword);
    
    // 实际应用中应该根据关键词搜索故事
    wx.showToast({
      title: `正在搜索: ${keyword}`,
      icon: 'none'
    });
    
    // 重新加载故事列表
    this.getStoryList();
  },

  /**
   * 切换分类
   */
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    
    this.setData({
      currentCategory: category
    });
    
    // 根据新的分类重新加载故事列表
    this.getStoryList();
  },

  /**
   * 显示故事筛选选项
   */
  showFilterOptions() {
    this.setData({
      showFilterModal: true
    });
  },

  /**
   * 关闭筛选模态框
   */
  closeFilterModal() {
    this.setData({
      showFilterModal: false
    });
  },

  /**
   * 选择年龄段筛选
   */
  selectAgeRange(e) {
    const age = e.currentTarget.dataset.age;
    
    this.setData({
      'filter.ageRange': age
    });
  },

  /**
   * 选择时长筛选
   */
  selectDuration(e) {
    const duration = e.currentTarget.dataset.duration;
    
    this.setData({
      'filter.duration': duration
    });
  },

  /**
   * 选择排序方式
   */
  selectSort(e) {
    const sort = e.currentTarget.dataset.sort;
    
    this.setData({
      'filter.sort': sort
    });
  },

  /**
   * 应用筛选条件
   */
  applyFilter() {
    // 关闭筛选模态框
    this.closeFilterModal();
    
    // 重新加载故事列表
    this.getStoryList();
  },

  /**
   * 重置筛选条件
   */
  resetFilter() {
    this.setData({
      filter: {
        ageRange: 'all',
        duration: 'all',
        sort: 'popular'
      }
    });
  },

  /**
   * 播放故事
   */
  playStory(e) {
    const id = e.currentTarget.dataset.id;
    const story = this.data.storyList.find(item => item.id === id);
    
    if (story) {
      wx.showToast({
        title: `正在播放: ${story.title}`,
        icon: 'none'
      });
      
      // 实际应用中应该跳转到播放页面或启动播放器
    }
  },

  /**
   * 显示上传选项
   */
  showUploadOptions() {
    this.setData({
      showUploadOptions: true
    });
    
    // 添加动画
    setTimeout(() => {
      this.setData({
        showUploadOptionsClass: 'slide-up'
      });
    }, 50);
  },

  /**
   * 隐藏上传选项
   */
  hideUploadOptions() {
    this.setData({
      showUploadOptionsClass: ''
    });
    
    // 延迟关闭弹窗，让动画有时间完成
    setTimeout(() => {
      this.setData({
        showUploadOptions: false
      });
    }, 300);
  },

  /**
   * 打开AI故事上传模态框
   */
  uploadAIStory() {
    // 获取用户自定义音色（模拟数据）
    const myVoices = [
      { id: 1, name: '我的录音1' },
      { id: 2, name: '我的录音2' }
    ];
    
    this.setData({
      showUploadOptions: false,
      showAIUploadModal: true,
      myVoices: myVoices,
      // 重置故事数据
      newStory: {
        title: '',
        category: '',
        description: '',
        content: '',
        language: 'zh',
        voiceType: 'system',
        voice: '',
        isPrivate: true
      },
      tempCoverUrl: ''
    });
  },
  
  /**
   * 关闭AI故事上传模态框
   */
  closeAIUploadModal() {
    this.setData({
      showAIUploadModal: false
    });
  },
  
  /**
   * 打开文本故事上传模态框
   */
  uploadTextStory() {
    this.setData({
      showUploadOptions: false,
      showTextUploadModal: true,
      // 重置故事数据
      newStory: {
        title: '',
        category: '',
        description: '',
        content: '',
        isPrivate: true
      },
      tempCoverUrl: ''
    });
  },
  
  /**
   * 关闭文本故事上传模态框
   */
  closeTextUploadModal() {
    this.setData({
      showTextUploadModal: false
    });
  },
  
  /**
   * 打开录音故事上传模态框
   */
  uploadAudioStory() {
    this.setData({
      showUploadOptions: false,
      showAudioUploadModal: true,
      // 重置故事数据
      newStory: {
        title: '',
        category: '',
        description: '',
        isPrivate: true
      },
      // 重置录音状态
      isRecording: false,
      recordStatusText: '点击开始录制您的故事',
      recordingComplete: false,
      recordingDuration: 0,
      tempVoiceFilePath: ''
    });
  },
  
  /**
   * 关闭录音故事上传模态框
   */
  closeAudioUploadModal() {
    this.setData({
      showAudioUploadModal: false
    });
    
    // 如果有正在进行的录音，停止它
    if (this.data.isRecording) {
      const recorderManager = wx.getRecorderManager();
      recorderManager.stop();
      this.clearRecordTimer();
    }
  },
  
  /**
   * 选择故事封面图片
   */
  chooseCoverImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 获取临时文件路径
        const tempFilePath = res.tempFilePaths[0];
        
        this.setData({
          tempCoverUrl: tempFilePath
        });
        
        // 这里可以添加上传图片到服务器的逻辑
        wx.showToast({
          title: '封面上传成功',
          icon: 'success'
        });
      }
    });
  },
  
  /**
   * 处理故事标题输入
   */
  handleStoryTitleInput(e) {
    this.setData({
      'newStory.title': e.detail.value
    });
  },
  
  /**
   * 处理故事类别变更
   */
  handleStoryCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      'newStory.category': this.data.categoryOptions[index]
    });
  },
  
  /**
   * 处理故事描述输入
   */
  handleStoryDescInput(e) {
    this.setData({
      'newStory.description': e.detail.value
    });
  },
  
  /**
   * 处理故事内容输入
   */
  handleStoryContentInput(e) {
    this.setData({
      'newStory.content': e.detail.value
    });
  },
  
  /**
   * 选择语言
   */
  selectLanguage(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      'newStory.language': lang
    });
  },
  
  /**
   * 选择音色类型（系统/自定义）
   */
  selectVoiceType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'newStory.voiceType': type,
      // 清空当前选择的音色
      'newStory.voice': ''
    });
  },
  
  /**
   * 处理系统音色选择
   */
  handleSystemVoiceChange(e) {
    const index = e.detail.value;
    this.setData({
      systemVoiceIndex: index,
      'newStory.voice': this.data.systemVoices[index]
    });
  },
  
  /**
   * 处理自定义音色选择
   */
  handleCustomVoiceChange(e) {
    const index = e.detail.value;
    this.setData({
      customVoiceIndex: index,
      'newStory.voice': this.data.myVoices[index].name
    });
  },
  
  /**
   * 处理发布选项变更
   */
  handlePublishOptionChange(e) {
    const value = e.detail.value;
    this.setData({
      'newStory.isPrivate': value === 'private'
    });
  },
  
  /**
   * 提交AI故事
   */
  submitAIStory() {
    // 验证表单
    if (!this.validateStoryForm(true)) {
      return;
    }
    
    // 模拟上传处理
    wx.showLoading({
      title: '正在生成AI音频...'
    });
    
    // 模拟API请求延迟
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '提交成功，等待审核',
        icon: 'success',
        duration: 2000
      });
      
      // 关闭模态框
      this.setData({
        showAIUploadModal: false
      });
      
      // 更新故事列表（模拟）
      const newStoryList = [...this.data.storyList];
      newStoryList.unshift({
        id: new Date().getTime(),
        title: this.data.newStory.title,
        description: this.data.newStory.description,
        category: this.data.newStory.category,
        cover: this.data.tempCoverUrl || '/images/default_cover.png',
        duration: '3:25',
        plays: 0,
        isNew: true,
        isCustom: true
      });
      
      this.setData({
        storyList: newStoryList
      });
    }, 3000);
  },
  
  /**
   * 提交文本故事
   */
  submitTextStory() {
    // 验证表单
    if (!this.validateStoryForm(false)) {
      return;
    }
    
    // 模拟上传处理
    wx.showLoading({
      title: '上传中...'
    });
    
    // 模拟API请求延迟
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '提交成功，等待审核',
        icon: 'success',
        duration: 2000
      });
      
      // 关闭模态框
      this.setData({
        showTextUploadModal: false
      });
      
      // 更新故事列表（模拟）
      const newStoryList = [...this.data.storyList];
      newStoryList.unshift({
        id: new Date().getTime(),
        title: this.data.newStory.title,
        description: this.data.newStory.description,
        category: this.data.newStory.category,
        cover: this.data.tempCoverUrl || '/images/default_cover.png',
        duration: '2:45',
        plays: 0,
        isNew: true,
        isCustom: true
      });
      
      this.setData({
        storyList: newStoryList
      });
    }, 2000);
  },
  
  /**
   * 验证故事表单
   * @param {boolean} isAIStory 是否为AI故事（需要验证语言和音色）
   */
  validateStoryForm(isAIStory) {
    const { title, category, description, content, voice } = this.data.newStory;
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入故事标题',
        icon: 'none'
      });
      return false;
    }
    
    if (!category) {
      wx.showToast({
        title: '请选择故事类别',
        icon: 'none'
      });
      return false;
    }
    
    if (!description.trim()) {
      wx.showToast({
        title: '请输入简短描述',
        icon: 'none'
      });
      return false;
    }
    
    if (!content.trim() && !isAIStory) {
      wx.showToast({
        title: '请输入故事内容',
        icon: 'none'
      });
      return false;
    }
    
    if (isAIStory) {
      if (!content.trim()) {
        wx.showToast({
          title: '请输入故事内容',
          icon: 'none'
        });
        return false;
      }
      
      if (!voice) {
        wx.showToast({
          title: '请选择音色',
          icon: 'none'
        });
        return false;
      }
    }
    
    return true;
  }
}); 