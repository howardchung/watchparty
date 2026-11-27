package top.roomio.app.room

internal interface BugReportState {
    val bugReportOpen: Boolean
    val bugScreenshots: List<top.roomio.domain.party.ReportScreenshot>
    val bugScreenshotError: String?
    val bugDescription: String
    val bugSending: Boolean
    val bugError: String?
    val bugSent: Boolean
}

internal data class HomeBugReportState(
    override val bugReportOpen: Boolean = false,
    override val bugScreenshots: List<top.roomio.domain.party.ReportScreenshot> = emptyList(),
    override val bugScreenshotError: String? = null,
    override val bugDescription: String = "",
    override val bugSending: Boolean = false,
    override val bugError: String? = null,
    override val bugSent: Boolean = false,
) : BugReportState
