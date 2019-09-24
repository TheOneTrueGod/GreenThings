<?php require_once('js_includes.php'); ?>

<link rel="stylesheet" type="text/css" href="../style/style.css">
<div class="pageBorder">
	<div class="titleArea">
		<h2> Green Things </h2>
	</div>
	<div id="gameContainer">
		<div
			id="loadingContainer"
			class="screen"
		>
			<div class="loadingScreen">
				Loading
			</div>
		</div>
		<div
			id="gameCanvasContainer"
			class="screen"
			style="display: none;"
		>
			<div class="turnControls">
				<div class="phaseContainer" data-phase="move" style="display: none;">
					<div class="phaseSection half floatLeft">Move Phase</div>
					<div id="doneMoveButton" class="button">
						Done
					</div>
				</div>
				<div class="phaseContainer" data-phase="attack" style="display: none;">
					<div id="doneAttackButton" class="button">
						Done
					</div>
					<div class="phaseSection half floatRight">Attack Phase</div>
				</div>
				<div class="phaseContainer" data-phase="alien" style="display: none;">
					<div class="phaseSection">Alien Phase</div>
				</div>
			</div>
		</div>
	</div>
</div>