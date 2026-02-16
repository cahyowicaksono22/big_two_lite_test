import MyHand from './MyHand'
import ActionControls from './ActionControls'

export default function PlayerArea() {
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <ActionControls />
            <MyHand />
        </div>
    )
}
