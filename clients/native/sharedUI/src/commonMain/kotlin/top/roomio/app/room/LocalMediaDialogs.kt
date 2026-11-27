package top.roomio.app.room

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*
import top.roomio.app.components.WatchPartyIcons
import top.roomio.app.components.WatchPartyTextField

@Composable
internal fun LocalMediaSourceDialog(busy: Boolean, onDismiss: () -> Unit, onFile: () -> Unit, onStream: (String) -> Unit) {
    var stream by remember { mutableStateOf(false) }
    var url by remember { mutableStateOf("") }
    AlertDialog(onDismissRequest=onDismiss,title={Text(stringResource(if(stream)Res.string.local_stream_url else Res.string.local_choose_video))},text={
        if(stream) WatchPartyTextField(value=url,onValueChange={url=it},label=stringResource(Res.string.direct_video_url),modifier=Modifier.fillMaxWidth())
        else Row(horizontalArrangement=Arrangement.spacedBy(12.dp)) {
            FilledTonalButton(onClick=onFile,enabled=!busy,modifier=Modifier.weight(1f).heightIn(min=144.dp),shape=MaterialTheme.shapes.extraLarge) {
                Column(horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(16.dp)) { Icon(WatchPartyIcons.FolderOpen,null,Modifier.size(36.dp));Text(stringResource(Res.string.local_file)) }
            }
            FilledTonalButton(onClick={stream=true},enabled=!busy,modifier=Modifier.weight(1f).heightIn(min=144.dp),shape=MaterialTheme.shapes.extraLarge) {
                Column(horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(16.dp)) { Icon(WatchPartyIcons.Link,null,Modifier.size(36.dp));Text(stringResource(Res.string.local_stream_url)) }
            }
        }
    },confirmButton={if(stream)Button(onClick={onStream(url.trim())},enabled=!busy&&url.trim().startsWith("https://")&&url.trim().length>8){Text(stringResource(Res.string.start_stream))}},dismissButton={if(stream)TextButton(onClick={stream=false}){Text(stringResource(Res.string.back))}})
}
