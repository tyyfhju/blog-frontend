<template>
  <div id="bot-container" @mouseenter="onEnter" @mouseleave="onLeave">
    <div class="Aurora-Dia" :class="{ active: active || autoShow }">
      <div class="Aurora-Dia--eyes" :class="{ moving: active || autoShow }">
        <div class="Aurora-Dia--eye left"></div>
        <div class="Aurora-Dia--eye right"></div>
      </div>
    </div>
    <div class="Aurora-Dia--platform"></div>
    <div id="Aurora-Dia--tips-wrapper" :class="{ active: active || autoShow }">
      <div class="Aurora-Dia--tips">
        <span>嘿~</span> {{ dialogueText }}
      </div>
    </div>
  </div>
</template>

<script>
import { getRandomDialogue } from '@/api/blog'

export default {
  name: 'AuroraDia',
  data() {
    return {
      active: false,
      autoShow: false,
      dialogueText: '欢迎来到 tyyfhju的博客',
      dialogueTimer: null,
      hideTimer: null
    }
  },
  mounted() {
    this.startDialogueLoop()
  },
  beforeDestroy() {
    this.clearTimers()
  },
  methods: {
    onEnter() {
      this.active = true
      this.clearTimers()
    },
    onLeave() {
      this.active = false
      this.startDialogueLoop()
    },
    async fetchDialogue() {
      try {
        const res = await getRandomDialogue()
        this.dialogueText = res.data.content || '欢迎来到 tyyfhju的博客'
      } catch (e) {
        // 保持当前台词不变
      }
    },
    startDialogueLoop() {
      this.clearTimers()
      const show = async () => {
        if (this.active) return
        await this.fetchDialogue()
        this.autoShow = true
        this.hideTimer = setTimeout(() => {
          this.autoShow = false
          this.dialogueTimer = setTimeout(show, 10000)
        }, 5000)
      }
      this.dialogueTimer = setTimeout(show, 4000)
    },
    clearTimers() {
      clearTimeout(this.dialogueTimer)
      clearTimeout(this.hideTimer)
      this.dialogueTimer = null
      this.hideTimer = null
    }
  }
}
</script>

<style scoped>
#bot-container {
  z-index: 1000;
  width: 70px;
  height: 60px;
  position: fixed;
  bottom: 0;
  left: 20px;
}
.Aurora-Dia {
  width: 65px;
  height: 50px;
  border: 4px solid var(--background-secondary);
  cursor: pointer;
  z-index: 1;
  border-radius: 45%;
  animation: 3s linear infinite breathe-and-jump;
  position: absolute;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.Aurora-Dia:before {
  content: "";
  background: var(--main-gradient);
  opacity: 1;
  border-radius: 45%;
  width: calc(100% + 3px);
  height: calc(100% + 2px);
  transition: all .3s linear;
  position: absolute;
  top: -1px;
  left: -1px;
}
.Aurora-Dia.active {
  animation: .75s linear deactivate, 5s linear infinite bounce-then-breathe;
}
.Aurora-Dia--eyes > .Aurora-Dia--eye {
  top: 10px;
  width: 8px;
  height: 15px;
  background-color: #fff;
  border-radius: 15px;
  animation: 5s linear infinite blink;
  position: absolute;
  box-shadow: 0 0 7px #ffffff80;
}
.Aurora-Dia--eye.left { left: 25%; }
.Aurora-Dia--eye.right { right: 25%; }
.Aurora-Dia--eyes.moving > .Aurora-Dia--eye { animation: none; }

.Aurora-Dia--platform {
  width: 60px;
  height: 60px;
  box-shadow: 0 0 70px #b712ac, 0 0 15px #b712ac inset;
  border-radius: 50%;
  transition: all .2s linear;
  animation: 3s linear infinite jump-pulse;
  position: relative;
  top: 0;
  transform: rotateX(70deg);
}
.Aurora-Dia:hover { height: 60px; animation: .5s linear shake-to-alert; transform: translateY(-7px); }
.Aurora-Dia:hover:before { background: linear-gradient(to bottom, #25b0cc, #3f60de); }
.Aurora-Dia:hover + .Aurora-Dia--platform {
  box-shadow: 0 0 70px #2cdcff, 0 0 15px #2cdcff inset;
  animation: .5s linear shake-pulse;
}
#Aurora-Dia--tips-wrapper {
  background: var(--main-gradient);
  width: 200px;
  min-height: 60px;
  color: var(--text-normal);
  opacity: 0;
  border-radius: 8px;
  padding: .2rem;
  transition: opacity .3s linear;
  animation: 3s linear infinite tips-breathe;
  position: absolute;
  bottom: 80px;
  right: -120px;
}
#Aurora-Dia--tips-wrapper.active { opacity: .86; }
.Aurora-Dia--tips {
  background: var(--background-secondary);
  text-overflow: ellipsis;
  border-radius: 6px;
  width: 100%;
  height: 100%;
  min-height: 60px;
  padding: .2rem .5rem;
  font-size: .8rem;
  font-weight: 800;
  position: relative;
  overflow: hidden;
}
.Aurora-Dia--tips > span {
  -webkit-text-fill-color: transparent;
  color: #7aa2f7;
  background-color: #7aa2f7;
  -webkit-background-clip: text;
  background-image: var(--strong-gradient);
  padding: 0 .1rem;
}

@keyframes deactivate {
  0%{border-color:var(--text-sub-accent)} 20%,60%{border-color:var(--text-accent)} 40%,80%,to{border-color:var(--background-secondary)}
}
@keyframes tips-breathe {
  0%,to{transform:translateY(0)} 50%{transform:translateY(-5px)}
}
@keyframes bounce-then-breathe {
  0%,5%,10%,15%{transform:translateY(0)} 2.5%,7.5%,12.5%{transform:translateY(-15px)}
  20%,40%,60%,80%,to{height:55px;transform:translateY(0)}
  30%,50%,70%,90%{height:60px;transform:translateY(-5px)}
}
@keyframes breathe-and-jump {
  0%,40%,80%,to{height:55px;transform:translateY(0)}
  20%,60%,70%,90%{height:60px;transform:translateY(-5px)}
  85%{height:45px;transform:translateY(-20px)}
}
@keyframes blink {
  0%,to{transform:scaleY(.05)} 5%,95%{transform:scale(1)}
}
@keyframes jump-pulse {
  0%,40%,80%,to{box-shadow:0 0 30px #b712ac,0 0 45px #b712ac inset}
  20%,60%,70%,90%{box-shadow:0 0 70px #b712ac,0 0 25px #b712ac inset}
  85%{box-shadow:0 0 100px #b712ac,0 0 15px #b712ac inset}
}
@keyframes shake-to-alert {
  0%,20%,40%,60%,80%,to{transform:rotate(0)translateY(-8px)}
  10%,25%,35%,50%,65%{transform:rotate(7deg)translateY(-8px)}
  15%,30%,45%,55%,70%{transform:rotate(-7deg)translateY(-8px)}
}
@keyframes shake-pulse {
  0%,20%,40%,60%,80%,to{box-shadow:0 0 60px #2cdcff,0 0 15px #2cdcff inset}
  10%,25%,35%,50%,65%{box-shadow:0 0 75px #2cdcff,0 0 15px #2cdcff inset}
  15%,30%,45%,55%,70%{box-shadow:0 0 45px #2cdcff,0 0 15px #2cdcff inset}
}
</style>
