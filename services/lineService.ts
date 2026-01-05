
// LINE Message API 服務
export interface LineMessage {
  type: 'text' | 'template' | 'flex';
  text?: string;
  altText?: string;
  template?: any;
  contents?: any;
}

export interface LinePushMessage {
  to: string; // LINE User ID
  messages: LineMessage[];
}

class LineService {
  private channelAccessToken: string | null = null;

  // 設定 Channel Access Token
  setChannelAccessToken(token: string) {
    this.channelAccessToken = token;
    localStorage.setItem('tsa_line_channel_token', token);
  }

  // 獲取 Channel Access Token
  getChannelAccessToken(): string | null {
    if (!this.channelAccessToken) {
      this.channelAccessToken = localStorage.getItem('tsa_line_channel_token');
    }
    return this.channelAccessToken;
  }

  // 發送推播訊息
  async pushMessage(lineId: string, messages: LineMessage[]): Promise<void> {
    const token = this.getChannelAccessToken();
    if (!token) {
      throw new Error('LINE Channel Access Token 未設定');
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: lineId,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '發送訊息失敗');
    }
  }

  // 發送客製化訊息（綁定通知）
  async sendBindingMessage(lineId: string, userName: string, mission: string, phone: string): Promise<void> {
    const messages: LineMessage[] = [
      {
        type: 'text',
        text: `您好 ${userName}！\n\n您的 LINE 帳號已成功綁定：\n姓名：${userName}\n使命：${mission}\n手機：${phone}\n\n之後填寫問卷時，系統會自動帶入這些資料。`
      }
    ];

    await this.pushMessage(lineId, messages);
  }

  // 發送問卷連結訊息
  async sendQuestionnaireMessage(lineId: string, questionnaireUrl: string, userName?: string): Promise<void> {
    const messages: LineMessage[] = [
      {
        type: 'text',
        text: userName 
          ? `${userName}，請點擊以下連結填寫問卷：\n${questionnaireUrl}`
          : `請點擊以下連結填寫問卷：\n${questionnaireUrl}`
      }
    ];

    await this.pushMessage(lineId, messages);
  }
}

export const lineService = new LineService();


