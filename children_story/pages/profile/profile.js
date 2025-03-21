/**
 * 我的页面脚本
 * 实现个人中心功能和页面跳转
 */
Page({
  data: {
    isPlaying: true, // 是否显示播放栏
    isPaused: false, // 播放器状态
    userInfo: {
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D',
      username: '小童童',
      gender: '女',
      listenedCount: 28,
      favoritesCount: 12,
    },
    memberInfo: {
      isMember: true,
      expireDate: '2024/12/31'
    },
    // 宝宝信息
    babyInfo: null,
    // 添加声音库相关数据
    showAddVoiceModal: false, // 是否显示添加声音模态框
    isRecording: false, // 是否正在录音
    recordingComplete: false, // 录音是否完成
    recordStatusText: '点击开始录制您的声音', // 录音状态文本
    newVoiceName: '', // 新建声音名称
    customVoices: [], // 自定义声音列表
    recorderManager: null, // 录音管理器
    
    // 引导页相关
    showGuide: false, // 是否显示引导页
    currentGuideStep: 0, // 当前引导步骤
    
    // 编辑个人信息相关
    showEditProfileModal: false, // 是否显示编辑个人信息模态框
    editUserInfo: {
      username: '',
      gender: '女'
    }, // 编辑中的用户信息
    
    // 编辑宝宝信息相关
    showEditBabyModal: false, // 是否显示编辑宝宝信息模态框
    editBabyInfo: {
      name: '',
      gender: '男孩',
      age: ''
    }, // 编辑中的宝宝信息
    ageRange: ['0-1岁', '2-3岁', '4-5岁', '6岁以上'], // 年龄范围选项
    ageIndex: 0, // 年龄选择器的索引
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '我的'
    });

    // 初始化录音管理器
    this.initRecorderManager();
    
    // 加载自定义声音列表
    this.loadCustomVoices();
    
    // 加载用户信息
    this.loadUserInfo();
    
    // 加载宝宝信息
    this.loadBabyInfo();
    
    // 判断是否需要显示引导页
    this.checkIfNeedGuide();
  },
  
  /**
   * 检查是否需要显示引导页
   */
  checkIfNeedGuide() {
    const hasUserInfo = wx.getStorageSync('userInfo');
    const hasBabyInfo = wx.getStorageSync('babyInfo');
    
    if (!hasUserInfo || !hasBabyInfo) {
      // 准备引导页需要的数据
      const defaultEditUserInfo = {
        username: '',
        gender: '女'
      };
      
      const defaultEditBabyInfo = {
        name: '',
        gender: '男孩',
        age: this.data.ageRange[0]
      };
      
      this.setData({
        showGuide: true,
        currentGuideStep: 0,
        editUserInfo: defaultEditUserInfo,
        editBabyInfo: defaultEditBabyInfo,
        ageIndex: 0
      });
    }
  },
  
  /**
   * 处理用户名输入变更
   */
  handleUsernameInput(e) {
    this.setData({
      'editUserInfo.username': e.detail.value
    });
  },
  
  /**
   * 获取微信用户信息
   */
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res);
        const userInfo = res.userInfo;
        
        // 更新编辑中的用户信息
        this.setData({
          'editUserInfo.username': userInfo.nickName,
          'editUserInfo.gender': userInfo.gender === 1 ? '男' : '女',
          'userInfo.avatar': userInfo.avatarUrl
        });
        
        wx.showToast({
          title: '获取成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        this.setData({
          userInfo: parsedUserInfo
        });
      } catch (error) {
        console.error('解析用户信息失败', error);
      }
    }
  },
  
  /**
   * 加载宝宝信息
   */
  loadBabyInfo() {
    const babyInfo = wx.getStorageSync('babyInfo');
    if (babyInfo) {
      try {
        const parsedBabyInfo = JSON.parse(babyInfo);
        this.setData({
          babyInfo: parsedBabyInfo
        });
      } catch (error) {
        console.error('解析宝宝信息失败', error);
      }
    }
  },
  
  /**
   * 引导页-下一步
   */
  nextGuideStep() {
    const { currentGuideStep, editUserInfo, editBabyInfo } = this.data;
    
    // 如果当前是最后一步，保存设置并关闭引导页
    if (currentGuideStep === 2) {
      this.completeGuide();
      return;
    }
    
    // 对每一步进行验证
    if (currentGuideStep === 0) {
      // 验证用户信息
      console.log('验证用户信息', editUserInfo);
      if (!editUserInfo.username) {
        wx.showToast({
          title: '请输入您的昵称',
          icon: 'none'
        });
        return;
      }
    } else if (currentGuideStep === 1) {
      // 验证宝宝信息
      console.log('验证宝宝信息', editBabyInfo);
      if (!editBabyInfo.name) {
        wx.showToast({
          title: '请输入宝宝名称',
          icon: 'none'
        });
        return;
      }
    }
    
    // 前进到下一步
    this.setData({
      currentGuideStep: currentGuideStep + 1
    });
  },
  
  /**
   * 引导页-上一步
   */
  prevGuideStep() {
    const { currentGuideStep } = this.data;
    if (currentGuideStep > 0) {
      this.setData({
        currentGuideStep: currentGuideStep - 1
      });
    }
  },
  
  /**
   * 完成引导并保存信息
   */
  completeGuide() {
    // 保存用户信息
    const userInfo = {
      ...this.data.userInfo,
      username: this.data.editUserInfo.username,
      gender: this.data.editUserInfo.gender
    };
    
    wx.setStorageSync('userInfo', JSON.stringify(userInfo));
    
    // 保存宝宝信息
    wx.setStorageSync('babyInfo', JSON.stringify(this.data.editBabyInfo));
    
    // 更新页面数据
    this.setData({
      userInfo,
      babyInfo: this.data.editBabyInfo,
      showGuide: false
    });
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    });
  },
  
  /**
   * 处理性别选择变更
   */
  handleGenderChange(e) {
    this.setData({
      'editUserInfo.gender': e.detail.value
    });
  },
  
  /**
   * 处理宝宝性别选择变更
   */
  handleBabyGenderChange(e) {
    this.setData({
      'editBabyInfo.gender': e.detail.value
    });
  },
  
  /**
   * 处理宝宝年龄选择变更
   */
  handleBabyAgeChange(e) {
    const index = e.detail.value;
    this.setData({
      ageIndex: index,
      'editBabyInfo.age': this.data.ageRange[index]
    });
  },
  
  /**
   * 编辑个人资料
   */
  editProfile() {
    this.setData({
      showEditProfileModal: true,
      editUserInfo: {
        username: this.data.userInfo.username,
        gender: this.data.userInfo.gender || '女'
      }
    });
  },
  
  /**
   * 关闭编辑个人信息模态框
   */
  closeEditProfileModal() {
    this.setData({
      showEditProfileModal: false
    });
  },
  
  /**
   * 保存编辑后的个人信息
   */
  saveEditProfile() {
    if (!this.data.editUserInfo.username) {
      wx.showToast({
        title: '请输入您的昵称',
        icon: 'none'
      });
      return;
    }
    
    // 更新内存中的用户信息
    const userInfo = {
      ...this.data.userInfo,
      username: this.data.editUserInfo.username,
      gender: this.data.editUserInfo.gender
    };
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', JSON.stringify(userInfo));
    
    // 更新页面数据
    this.setData({
      userInfo,
      showEditProfileModal: false
    });
    
    wx.showToast({
      title: '个人信息已更新',
      icon: 'success'
    });
  },
  
  /**
   * 编辑宝宝信息
   */
  editBabyInfo() {
    // 如果已有宝宝信息，使用已有信息初始化编辑数据
    if (this.data.babyInfo) {
      // 找到对应的年龄索引
      const ageIndex = this.data.ageRange.findIndex(age => age === this.data.babyInfo.age);
      
      this.setData({
        showEditBabyModal: true,
        editBabyInfo: {
          name: this.data.babyInfo.name,
          gender: this.data.babyInfo.gender,
          age: this.data.babyInfo.age
        },
        ageIndex: ageIndex !== -1 ? ageIndex : 0
      });
    } else {
      // 否则使用默认值
      this.setData({
        showEditBabyModal: true,
        editBabyInfo: {
          name: '',
          gender: '男孩',
          age: this.data.ageRange[0]
        },
        ageIndex: 0
      });
    }
  },
  
  /**
   * 关闭编辑宝宝信息模态框
   */
  closeEditBabyModal() {
    this.setData({
      showEditBabyModal: false
    });
  },
  
  /**
   * 保存编辑后的宝宝信息
   */
  saveEditBaby() {
    if (!this.data.editBabyInfo.name) {
      wx.showToast({
        title: '请输入宝宝名称',
        icon: 'none'
      });
      return;
    }
    
    // 保存到本地存储
    wx.setStorageSync('babyInfo', JSON.stringify(this.data.editBabyInfo));
    
    // 更新页面数据
    this.setData({
      babyInfo: this.data.editBabyInfo,
      showEditBabyModal: false
    });
    
    wx.showToast({
      title: '宝宝信息已更新',
      icon: 'success'
    });
  },
  
  /**
   * 在引导页中显示添加声音模态框
   */
  showAddVoiceFromGuide() {
    this.setData({
      showAddVoiceModal: true
    });
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
        recordingComplete: false
      });
    });
    
    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      const { tempFilePath } = res;
      
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
   * 加载自定义声音列表
   */
  loadCustomVoices() {
    // 这里应该从后端或本地存储获取用户自定义声音列表
    // 示例数据
    const customVoices = wx.getStorageSync('customVoices') || [];
    this.setData({ 
      customVoices: customVoices.length > 0 ? JSON.parse(customVoices) : [] 
    });
  },
  
  /**
   * 显示添加声音模态框
   */
  showAddVoiceModal() {
    this.setData({
      showAddVoiceModal: true,
      newVoiceName: '',
      isRecording: false,
      recordingComplete: false,
      recordStatusText: '点击开始录制您的声音',
      tempVoiceFilePath: ''
    });
  },
  
  /**
   * 关闭添加声音模态框
   */
  closeAddVoiceModal() {
    // 如果正在录音，停止录音
    if (this.data.isRecording) {
      this.recorderManager.stop();
    }
    
    this.setData({
      showAddVoiceModal: false
    });
  },
  
  /**
   * 切换录音状态
   */
  toggleRecording() {
    if (this.data.isRecording) {
      // 停止录音
      this.recorderManager.stop();
    } else {
      // 开始录音
      const options = {
        duration: 60000, // 最长录音时间，单位ms
        sampleRate: 44100, // 采样率
        numberOfChannels: 1, // 录音通道数
        encodeBitRate: 192000, // 编码码率
        format: 'mp3', // 音频格式
      };
      
      // 请求录音权限
      wx.authorize({
        scope: 'scope.record',
        success: () => {
          this.recorderManager.start(options);
        },
        fail: () => {
          wx.showModal({
            title: '提示',
            content: '需要录音权限才能创建AI声音',
            showCancel: false
          });
        }
      });
    }
  },
  
  /**
   * 保存录制的声音
   */
  saveVoice() {
    if (!this.data.newVoiceName) {
      wx.showToast({
        title: '请输入声音名称',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.recordingComplete) {
      wx.showToast({
        title: '请先完成录音',
        icon: 'none'
      });
      return;
    }
    
    // 这里应该调用后端接口上传录音文件并创建AI声音模型
    // 模拟上传过程
    wx.showLoading({
      title: '正在创建AI声音...',
      mask: true
    });
    
    setTimeout(() => {
      // 模拟AI声音生成成功
      const newVoice = {
        id: 'voice_' + Date.now(),
        name: this.data.newVoiceName,
        type: '自定义',
        selected: false,
        createTime: new Date().toISOString()
      };
      
      // 更新自定义声音列表
      const customVoices = [...this.data.customVoices, newVoice];
      this.setData({
        customVoices,
        showAddVoiceModal: false
      });
      
      // 保存到本地存储
      wx.setStorageSync('customVoices', JSON.stringify(customVoices));
      
      wx.hideLoading();
      wx.showToast({
        title: 'AI声音创建成功',
        icon: 'success'
      });
    }, 2000);
  },
  
  /**
   * 播放声音示例
   */
  playVoiceSample(e) {
    const { voice } = e.currentTarget.dataset;
    
    wx.showToast({
      title: `播放${voice}声音示例`,
      icon: 'none'
    });
    
    // 这里应该播放对应声音的示例音频
  },
  
  /**
   * 选择声音
   */
  selectVoice(e) {
    const { voice } = e.currentTarget.dataset;
    
    // 更新自定义声音选择状态
    const customVoices = this.data.customVoices.map(item => {
      return {
        ...item,
        selected: item.id === voice
      };
    });
    
    this.setData({ customVoices });
    
    // 保存到本地存储
    wx.setStorageSync('customVoices', JSON.stringify(customVoices));
    
    wx.showToast({
      title: `已设置为默认声音`,
      icon: 'success'
    });
  },
  
  /**
   * 切换播放状态
   */
  togglePlay() {
    this.setData({
      isPaused: !this.data.isPaused
    });
    
    wx.showToast({
      title: this.data.isPaused ? '已暂停' : '继续播放',
      icon: 'none'
    });
  },
  
  /**
   * 上一曲
   */
  prevTrack() {
    wx.showToast({
      title: '切换到上一个故事',
      icon: 'none'
    });
  },
  
  /**
   * 下一曲
   */
  nextTrack() {
    wx.showToast({
      title: '切换到下一个故事',
      icon: 'none'
    });
  },
  
  /**
   * 跳转到历史记录页面
   */
  goToHistory() {
    wx.showToast({
      title: '查看历史记录',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到历史记录页面
    // wx.navigateTo({
    //   url: '/pages/profile/history'
    // });
  },
  
  /**
   * 跳转到我的收藏页面
   */
  goToFavorites() {
    wx.showToast({
      title: '查看我的收藏',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到收藏页面
    // wx.navigateTo({
    //   url: '/pages/profile/favorites'
    // });
  },
  
  /**
   * 跳转到已下载故事页面
   */
  goToDownloads() {
    wx.showToast({
      title: '查看已下载故事',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到下载页面
    // wx.navigateTo({
    //   url: '/pages/profile/downloads'
    // });
  },
  
  /**
   * 跳转到家长控制页面
   */
  goToParentControl() {
    wx.showToast({
      title: '查看家长控制',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到家长控制页面
    // wx.navigateTo({
    //   url: '/pages/profile/parent_control'
    // });
  },
  
  /**
   * 跳转到设置页面
   */
  goToSettings() {
    wx.showToast({
      title: '查看设置',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到设置页面
    // wx.navigateTo({
    //   url: '/pages/profile/settings'
    // });
  },
  
  /**
   * 跳转到帮助与反馈页面
   */
  goToHelp() {
    wx.showToast({
      title: '查看帮助与反馈',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到帮助页面
    // wx.navigateTo({
    //   url: '/pages/profile/help'
    // });
  },
  
  /**
   * 跳转到关于页面
   */
  goToAbout() {
    wx.showToast({
      title: '查看关于童声故事',
      icon: 'none'
    });
    
    // 实际应用中应该跳转到关于页面
    // wx.navigateTo({
    //   url: '/pages/profile/about'
    // });
  },
  
  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('babyInfo');
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 重新加载页面，触发引导流程
          setTimeout(() => {
            this.onLoad();
          }, 1000);
        }
      }
    });
  },
  
  /**
   * 导航到首页
   */
  navigateToHome() {
    wx.showToast({
      title: '正在跳转到首页',
      icon: 'none'
    });
    
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  
  /**
   * 导航到故事库
   */
  navigateToStoryStore() {
    wx.showToast({
      title: '正在跳转到故事库',
      icon: 'none'
    });
    
    wx.switchTab({
      url: '/pages/story_store/story_store'
    });
  },
  
  /**
   * 处理宝宝名称输入变更
   */
  handleBabyNameInput(e) {
    this.setData({
      'editBabyInfo.name': e.detail.value
    });
  },
}); 