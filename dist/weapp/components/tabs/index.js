import Taro from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { uuid, isTest } from '../../common/utils'
import AtComponent from '../../common/component'

const ENV = Taro.getEnv()

export default class AtTabs extends AtComponent {
  constructor () {
    super(...arguments)
    this.state = {
      _scrollLeft: '',
      _scrollTop: '',
      _scrollIntoView: ''
    }
    this._tabId = isTest() ? 'tabs-AOTU2018' : uuid()
    // 触摸时的原点
    this._touchDot = 0;
    this._touchDotY = 0
    // 定时器
    this._timer = null
    // 滑动时间间隔
    this._interval = 0
    // 是否已经在滑动
    this._isMoving = false
  }

  updateState = idx => {
    if (this.props.scroll) {
      // 标签栏滚动
      switch (ENV) {
        case Taro.ENV_TYPE.WEAPP:
        case Taro.ENV_TYPE.ALIPAY:
        case Taro.ENV_TYPE.SWAN:
          this.setState({
            _scrollIntoView: `tab${idx - 1}`
          })
          break

        case Taro.ENV_TYPE.WEB: {
          const index = Math.max(idx - 1, 0)
          const prevTabItem = this.tabHeaderRef.childNodes[index]
          this.setState({
            _scrollTop: prevTabItem.offsetTop,
            _scrollLeft: prevTabItem.offsetLeft
          })
          break
        }

        default:
          console.warn('AtTab 组件在该环境还未适配')
          break
      }
    }
  }

  handleClick () {
    this.props.onClick(...arguments)
  }

  handleTouchStart (e) {
    // console.log("====handleTouchStart=63=== e.touches[0].pageY==>", e.touches[0].pageY)
    const { swipeable, tabDirection } = this.props
    if (!swipeable || tabDirection === 'vertical') return
    // 获取触摸时的原点
    this._touchDot = e.touches[0].pageX
    this._touchDotY = e.touches[0].pageY
    // 使用js计时器记录时间
    // this._timer = setInterval(() => {
    //   console.log("====this._interval==70===>",this._interval)
    //   this._interval++;      
    // }, 100)
  }

  // handleTouchMove (e) {
  //   const {
  //     swipeable,
  //     tabDirection,
  //     current,
  //     tabList
  //   } = this.props
  //   if (!swipeable || tabDirection === 'vertical') return

  //   const touchMove = e.touches[0].pageX
  //   const touchMoveY = e.touches[0].pageY
  //   const moveDistance = touchMove - this._touchDot;
  //   const moveDistanceY = touchMoveY - this._touchDotY;
  //   const maxIndex = tabList.length
  //   console.log("=======moveDistanceY====>",moveDistanceY)
  //   if (!this._isMoving && this._interval < 10) {     
  //     console.log("======计算==向左====>",current + 1,maxIndex,moveDistance,"<= -40")
  //     console.log("======计算==向右====>",current -1,maxIndex,moveDistance,">=40")
  //     // 向左滑动
  //     if (current + 1 < maxIndex && moveDistance <= -40) {
  //       console.log("======向左滑动========>")
  //       this._isMoving = true
  //       this.handleClick(current + 1)
        
  //     // 向右滑动
  //     } else if (current - 1 >= 0 && moveDistance >= 40) {
  //       console.log("======向右滑动========>")
  //       this._isMoving = true
  //       this.handleClick(current - 1);        
  //     }
  //   }
  // }

  handleTouchEnd (e) {
    // console.log("======handleTouchEnd====1====>",e)
    const { swipeable, tabDirection, current,tabList } = this.props
    // console.log("======handleTouchEnd====2=swipeable====tabDirection=>",swipeable,tabDirection)
    if (!swipeable || tabDirection === 'vertical') return
    // console.log("====e.changedTouches[0].pageY=>", e.changedTouches[0].pageY)
    const touchMove = e.changedTouches[0].pageX;
    const touchMoveY = e.changedTouches[0].pageY
    const moveDistance = touchMove - this._touchDot;
    const moveDistanceY = touchMoveY - this._touchDotY;
    const maxIndex = tabList.length
    // console.log("=======moveDistanceY====>",moveDistanceY)
    // console.log("=======handleTouchMove=====this._isMoving====this._interval===>",this._isMoving,this._interval);
    // console.log("=======handleTouchMove====moveDistance===current==>",moveDistance,current,maxIndex)
    if (!this._isMoving ) {     
      // console.log("======计算==向左====>",current + 1,maxIndex,moveDistance,"<= -40")
      // console.log("======计算==向右====>",current -1,maxIndex,moveDistance,">=40")
      // 向左滑动
      if ( moveDistanceY <=15 && moveDistanceY >=-15  && current + 1 < maxIndex && moveDistance <= -40) {
        // console.log("======向左滑动========>")
        this._isMoving = true
        this.handleClick(current + 1)
        
      // 向右滑动
      } else if (moveDistanceY <=15 && moveDistanceY >=-15 && current - 1 >= 0 && moveDistance >= 40) {
        // console.log("======向右滑动========>")
        this._isMoving = true
        this.handleClick(current - 1);        
      }
    }

    // console.log("======handleTouchEnd==3======>")
    // clearInterval(this._timer)
    // this._interval = 0
    // this._isMoving = false
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.scroll !== this.props.scroll) {
      this.getTabHeaderRef()
    }
    if (nextProps.current !== this.props.current) {
      this.updateState(nextProps.current)
    }
  }

  getTabHeaderRef () {
    if (ENV === Taro.ENV_TYPE.WEB) {
      this.tabHeaderRef = document.getElementById(this._tabId)
    }
  }

  componentDidMount () {
    this.getTabHeaderRef()
    this.updateState(this.props.current)
  }

  componentWillUnmount () {
    this.tabHeaderRef = null
  }

  render () {
    const {
      customStyle,
      className,
      height,
      tabDirection,
      animated,
      tabList,
      scroll,
      current,
      sticky
    } = this.props
    const {
      _scrollLeft,
      _scrollTop,
      _scrollIntoView
    } = this.state

    const heightStyle = { height }
    const underlineStyle = {
      height: tabDirection === 'vertical' ? `${tabList.length * 100}%` : '1PX',
      width: tabDirection === 'horizontal' ? `${tabList.length * 100}%` : '1PX'
    }
    const bodyStyle = { }
    let transformStyle = `translate3d(0px, -${current * 100}%, 0px)`
    if (tabDirection === 'horizontal') {
      transformStyle = `translate3d(-${current * 100}%, 0px, 0px)`
    }
    Object.assign(bodyStyle, {
      'transform': transformStyle,
      '-webkit-transform': transformStyle
    })
    if (!animated) {
      bodyStyle.transition = 'unset'
    }

    const tabItems = tabList.map((item, idx) => {
      const itemCls = classNames({
        'at-tabs__item': true,
        'at-tabs__item--active': current === idx
      })

      return <View
        className={itemCls}
        id={`tab${idx}`}
        key={item.title}
        onClick={this.handleClick.bind(this, idx)}
      >
        {item.title}
        <View className='at-tabs__item-underline'></View>
      </View>
    })
    const rootCls = classNames({
      'at-tabs': true,
      'at-tabs--scroll': scroll,
      [`at-tabs--${tabDirection}`]: true,
      [`at-tabs--${ENV}`]: true
    }, className)
    const scrollX = tabDirection === 'horizontal'
    const scrollY = tabDirection === 'vertical'
    
    // console.log("=====dddddddd=====>",this.mergeStyle(heightStyle, sticky));
    // console.log("=====scroll=====>",scroll);
    return (
      <View
        className={rootCls}
        style={this.mergeStyle(heightStyle, customStyle)}
      >
        {
          scroll && sticky && <ScrollView
                                id={this._tabId}
                                className='at-tabs__header_sticky'
                                style={heightStyle}
                                scrollX={scrollX}
                                scrollY={scrollY}
                                scrollWithAnimation
                                scrollLeft={_scrollLeft}
                                scrollTop={_scrollTop}
                                scrollIntoView={_scrollIntoView}
                              >
                                {tabItems}
                              </ScrollView>
        }
        {
          scroll && !sticky && <ScrollView
                                  id={this._tabId}
                                  className='at-tabs__header'
                                  style={heightStyle}
                                  scrollX={scrollX}
                                  scrollY={scrollY}
                                  scrollWithAnimation
                                  scrollLeft={_scrollLeft}
                                  scrollTop={_scrollTop}
                                  scrollIntoView={_scrollIntoView}
                                >
                                  {tabItems}
                                </ScrollView>
        }
        {
           !scroll && !sticky && <View id={this._tabId} className='at-tabs__header'>{tabItems}</View>
        }

        {
           !scroll && sticky && <View id={this._tabId} className='at-tabs__header_sticky'>{tabItems}</View>
        }
        <View style=" overflow:hidden;width:100%;height:100%;">
            <View
              className='at-tabs__body'
              onTouchStart={this.handleTouchStart.bind(this)}
              onTouchEnd={this.handleTouchEnd.bind(this)}          
              style={this.mergeStyle(bodyStyle, heightStyle)}
            >
                  <View className='at-tabs__underline' style={underlineStyle}></View>
                  {this.props.children}
            </View>
        </View>
        
      </View>
    )
  }
}

AtTabs.defaultProps = {
  isTest: false,
  customStyle: '',
  className: '',
  tabDirection: 'horizontal',
  height: '',
  current: 0,
  swipeable: true,
  scroll: false,
  animated: true,
  tabList: [],
  onClick: () => {},
}

AtTabs.propTypes = {
  customStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string
  ]),
  isTest: PropTypes.bool,
  height: PropTypes.string,
  tabDirection: PropTypes.oneOf(['horizontal', 'vertical']),
  current: PropTypes.number,
  swipeable: PropTypes.bool,
  scroll: PropTypes.bool,
  animated: PropTypes.bool,
  tabList: PropTypes.array,
  onClick: PropTypes.func,
}
