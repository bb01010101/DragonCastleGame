import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from 'next/image'
import { Input } from "@/components/ui/input"

interface PlayMenuProps {
  onPlay: () => void
  onSandboxMode?: () => void
  onUsernameChange: (username: string) => void
  username: string
}

export function PlayMenu({ onPlay, onSandboxMode, onUsernameChange, username }: PlayMenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="flex gap-4">
        {/* Player Card */}
        <Card className="w-64 bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-blue-400" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">0/100</span>
                <span className="text-red-500">💎 0</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <select className="w-full p-2 border rounded bg-gray-100">
              <option>Select Region</option>
              <option>US East</option>
              <option>US West</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>

          <div className="text-center text-gray-500 mb-4">
            Not Connected
          </div>

          <Button 
            variant="destructive"
            className="w-full mb-4"
          >
            Logout
          </Button>

          <Button 
            variant="default"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Achievements
          </Button>
        </Card>

        {/* Game Options Card */}
        <Card className="w-64 bg-white p-4 shadow-lg">
          <div className="text-xl font-bold mb-4 text-center">
            Dragon Castle
          </div>

          <div className="space-y-2">
            <Button 
              variant="default"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-between"
            >
              Shop
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">NEW</span>
            </Button>

            <Button 
              variant="default"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={onPlay}
              disabled={!username.trim()}
            >
              PLAY
            </Button>

            <Button 
              variant="default"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={onSandboxMode}
              disabled={!username.trim()}
            >
              Sandbox Mode
            </Button>

            <Button 
              variant="default"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Heroes/Skins
            </Button>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-1 flex items-center justify-center">
                🛡️
              </div>
              <div className="text-xs">+15% HP</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-1 flex items-center justify-center">
                ⚔️
              </div>
              <div className="text-xs">+1</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-1 flex items-center justify-center">
                💎
              </div>
              <div className="text-xs">3000</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Store badges */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        <a href="#" className="h-12">
          <Image 
            src="/google-play-badge.png" 
            alt="Get it on Google Play"
            width={160}
            height={48}
          />
        </a>
        <a href="#" className="h-12">
          <Image 
            src="/app-store-badge.png" 
            alt="Download on the App Store"
            width={160}
            height={48}
          />
        </a>
      </div>

      {/* How to Play */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-lg">
        <h3 className="font-bold mb-2">How to Play</h3>
        <p className="text-sm text-gray-600">
          Collect resources<br />
          Build your fortess<br />
          Amass your army<br />
          Conquer your enemies!
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4 flex gap-4 text-white text-sm">
        <a href="#" className="hover:underline">ChangeLog</a>
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Privacy</a>
        <span>v1.0.0</span>
      </div>
    </div>
  )
} 